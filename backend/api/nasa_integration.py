"""
NASA Data Integration Module
Integrates with NASA NEO API, USGS seismic data, and other NASA services
for realistic asteroid impact simulation
"""

import requests
import json
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import numpy as np
from dataclasses import dataclass

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AsteroidData:
    """Asteroid data structure matching NASA SBDB format"""
    designation: str
    name: str
    diameter: float  # km
    diameter_uncertainty: float
    mass: float  # kg
    velocity: float  # km/s
    orbital_elements: Dict
    close_approach_data: List[Dict]
    is_potentially_hazardous: bool
    absolute_magnitude: float
    albedo: float
    spectral_type: str

@dataclass
class ImpactParameters:
    """Impact simulation parameters"""
    asteroid_mass: float  # kg
    asteroid_diameter: float  # km
    impact_velocity: float  # km/s
    impact_angle: float  # degrees from vertical
    impact_location: Tuple[float, float]  # lat, lon
    target_material: str  # water, rock, ice, etc.

class NASADataService:
    """Service for fetching and processing NASA asteroid data"""
    
    def __init__(self, api_key: str = "GjBmdPeD3TleYlhrDHHd6tdDYvniKjui2iQaLfbn"):
        self.api_key = api_key
        self.base_url = "https://ssd-api.jpl.nasa.gov"
        self.usgs_base_url = "https://earthquake.usgs.gov/fdsnws/event/1"
        
    def get_near_earth_objects(self, limit: int = 50) -> List[AsteroidData]:
        """Fetch current near-Earth objects from NASA SBDB"""
        try:
            # Use the correct NASA NEO API endpoint
            url = "https://api.nasa.gov/neo/rest/v1/neo/browse"
            params = {
                'api_key': self.api_key,
                'size': limit
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            asteroids = []
            for obj in data.get('near_earth_objects', []):
                asteroid = self._parse_nasa_neo_data(obj)
                if asteroid:
                    asteroids.append(asteroid)
            
            logger.info(f"Fetched {len(asteroids)} near-Earth objects from NASA")
            return asteroids
            
        except Exception as e:
            logger.error(f"Error fetching NEO data: {e}")
            # Return some well-known asteroids as fallback
            return self._get_fallback_asteroids()
    
    def get_asteroid_by_designation(self, designation: str) -> Optional[AsteroidData]:
        """Fetch specific asteroid by designation"""
        try:
            url = f"{self.base_url}/sbdb.api"
            params = {
                'sstr': designation,
                'api_key': self.api_key
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return self._parse_detailed_asteroid_data(data)
            
        except Exception as e:
            logger.error(f"Error fetching asteroid {designation}: {e}")
            return None
    
    def get_potentially_hazardous_asteroids(self) -> List[AsteroidData]:
        """Fetch potentially hazardous asteroids"""
        try:
            url = f"{self.base_url}/neo.api"
            params = {
                'api_key': self.api_key,
                'pha': 'true',
                'limit': 100
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            asteroids = []
            for obj in data.get('data', []):
                asteroid = self._parse_asteroid_data(obj)
                if asteroid and asteroid.is_potentially_hazardous:
                    asteroids.append(asteroid)
            
            logger.info(f"Fetched {len(asteroids)} potentially hazardous asteroids")
            return asteroids
            
        except Exception as e:
            logger.error(f"Error fetching PHA data: {e}")
            return []
    
    def _parse_nasa_neo_data(self, data: Dict) -> Optional[AsteroidData]:
        """Parse asteroid data from NASA NEO API response"""
        try:
            # Extract basic info
            designation = data.get('name', '')
            name = data.get('designation', designation)
            
            # Get estimated diameter
            estimated_diameter = data.get('estimated_diameter', {})
            diameter_meters = estimated_diameter.get('meters', {})
            diameter_km = diameter_meters.get('estimated_diameter_max', 0) / 1000
            
            # Get absolute magnitude
            absolute_magnitude = data.get('absolute_magnitude_h', 0)
            
            # Calculate mass from diameter and density
            density = 2000  # kg/m³ average asteroid density
            radius_m = diameter_km * 500  # Convert km to m radius
            mass = (4/3) * np.pi * (radius_m ** 3) * density
            
            # Get orbital data
            orbital_data = data.get('orbital_data', {})
            
            # Get close approach data
            close_approach_data = data.get('close_approach_data', [])
            velocity = 0
            if close_approach_data:
                # Use relative velocity from closest approach
                closest_approach = min(close_approach_data, 
                                     key=lambda x: float(x.get('miss_distance', {}).get('kilometers', 'inf')))
                velocity = float(closest_approach.get('relative_velocity', {}).get('kilometers_per_second', 15))
            
            # Calculate orbital velocity if not available
            if velocity == 0:
                velocity = self._calculate_orbital_velocity_from_elements(orbital_data)
            
            # Determine composition from spectral type
            spectral_type = orbital_data.get('orbital_class', 'unknown')
            composition = self._determine_composition(spectral_type, absolute_magnitude)
            
            return AsteroidData(
                designation=designation,
                name=name,
                diameter=diameter_km,
                diameter_uncertainty=0,
                mass=mass,
                velocity=velocity,
                orbital_elements=self._extract_orbital_elements(orbital_data),
                close_approach_data=close_approach_data,
                is_potentially_hazardous=data.get('is_potentially_hazardous_asteroid', False),
                absolute_magnitude=absolute_magnitude,
                albedo=0.1,  # Default albedo
                spectral_type=spectral_type
            )
            
        except Exception as e:
            logger.error(f"Error parsing NASA NEO data: {e}")
            return None
    
    def _parse_asteroid_data(self, data: Dict) -> Optional[AsteroidData]:
        """Parse asteroid data from NASA API response"""
        try:
            # Extract orbital elements
            orbit_data = data.get('orbit', {})
            orbital_elements = {
                'semi_major_axis': float(orbit_data.get('a', 0)),
                'eccentricity': float(orbit_data.get('e', 0)),
                'inclination': float(orbit_data.get('i', 0)),
                'argument_of_perihelion': float(orbit_data.get('w', 0)),
                'longitude_of_ascending_node': float(orbit_data.get('om', 0)),
                'mean_anomaly': float(orbit_data.get('ma', 0)),
                'period': float(orbit_data.get('period', 0))
            }
            
            # Extract physical properties
            physical = data.get('physical', {})
            diameter = float(physical.get('diameter', 0))
            mass = float(physical.get('mass', 0))
            
            # Calculate velocity (approximate from orbital elements)
            velocity = self._calculate_orbital_velocity(orbital_elements)
            
            return AsteroidData(
                designation=data.get('des', ''),
                name=data.get('fullname', ''),
                diameter=diameter,
                diameter_uncertainty=float(physical.get('diameter_uncertainty', 0)),
                mass=mass,
                velocity=velocity,
                orbital_elements=orbital_elements,
                close_approach_data=data.get('close_approach_data', []),
                is_potentially_hazardous=data.get('pha', 'N') == 'Y',
                absolute_magnitude=float(data.get('h', 0)),
                albedo=float(physical.get('albedo', 0.1)),
                spectral_type=physical.get('spec_T', 'unknown')
            )
            
        except Exception as e:
            logger.error(f"Error parsing asteroid data: {e}")
            return None
    
    def _parse_detailed_asteroid_data(self, data: Dict) -> Optional[AsteroidData]:
        """Parse detailed asteroid data from SBDB API"""
        try:
            orbit_data = data.get('orbit', {})
            elements = orbit_data.get('elements', [])
            
            orbital_elements = {}
            for element in elements:
                name = element.get('name', '').lower()
                value = float(element.get('value', 0))
                orbital_elements[name] = value
            
            physical = data.get('physical', {})
            diameter = float(physical.get('diameter', 0))
            mass = float(physical.get('mass', 0))
            
            velocity = self._calculate_orbital_velocity(orbital_elements)
            
            return AsteroidData(
                designation=data.get('object', {}).get('des', ''),
                name=data.get('object', {}).get('fullname', ''),
                diameter=diameter,
                diameter_uncertainty=float(physical.get('diameter_uncertainty', 0)),
                mass=mass,
                velocity=velocity,
                orbital_elements=orbital_elements,
                close_approach_data=[],
                is_potentially_hazardous=data.get('pha', 'N') == 'Y',
                absolute_magnitude=float(data.get('h', 0)),
                albedo=float(physical.get('albedo', 0.1)),
                spectral_type=physical.get('spec_T', 'unknown')
            )
            
        except Exception as e:
            logger.error(f"Error parsing detailed asteroid data: {e}")
            return None
    
    def _calculate_orbital_velocity(self, orbital_elements: Dict) -> float:
        """Calculate approximate orbital velocity from orbital elements"""
        try:
            a = orbital_elements.get('semi_major_axis', 1.0)  # AU
            e = orbital_elements.get('eccentricity', 0)
            
            # Convert AU to km
            a_km = a * 149597870.7
            
            # Calculate velocity at perihelion (approximate)
            G = 6.67430e-11  # Gravitational constant
            M_sun = 1.989e30  # Solar mass in kg
            
            v = np.sqrt(G * M_sun * (1 + e) / (a_km * (1 - e)))
            return v / 1000  # Convert to km/s
            
        except:
            return 30.0  # Default velocity
    
    def get_earth_close_approaches(self, days: int = 30) -> List[Dict]:
        """Get upcoming close approaches to Earth"""
        try:
            url = f"{self.base_url}/cad.api"
            params = {
                'api_key': self.api_key,
                'date-min': datetime.now().strftime('%Y-%m-%d'),
                'date-max': (datetime.now() + timedelta(days=days)).strftime('%Y-%m-%d'),
                'dist-max': 10,  # Within 10 lunar distances
                'limit': 100
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            return data.get('data', [])
            
        except Exception as e:
            logger.error(f"Error fetching close approaches: {e}")
            return []
    
    def _calculate_orbital_velocity_from_elements(self, orbital_data: Dict) -> float:
        """Calculate orbital velocity from orbital elements"""
        try:
            semi_major_axis = float(orbital_data.get('semi_major_axis', 1.5))  # AU
            eccentricity = float(orbital_data.get('eccentricity', 0.1))
            
            # Convert AU to km
            a_km = semi_major_axis * 149597870.7
            
            # Calculate velocity at perihelion
            G = 6.67430e-11  # Gravitational constant
            M_sun = 1.989e30  # Solar mass in kg
            
            v = np.sqrt(G * M_sun * (1 + eccentricity) / (a_km * (1 - eccentricity)))
            return v / 1000  # Convert to km/s
            
        except:
            return 30.0  # Default velocity
    
    def _extract_orbital_elements(self, orbital_data: Dict) -> Dict:
        """Extract orbital elements from NASA data"""
        return {
            'semi_major_axis': float(orbital_data.get('semi_major_axis', 1.5)),
            'eccentricity': float(orbital_data.get('eccentricity', 0.1)),
            'inclination': float(orbital_data.get('inclination', 5.0)),
            'argument_of_perihelion': float(orbital_data.get('argument_of_perihelion', 0)),
            'longitude_of_ascending_node': float(orbital_data.get('longitude_of_ascending_node', 0)),
            'mean_anomaly': float(orbital_data.get('mean_anomaly', 0)),
            'period': float(orbital_data.get('orbital_period', 365))
        }
    
    def _determine_composition(self, spectral_type: str, absolute_magnitude: float) -> str:
        """Determine asteroid composition from spectral type and magnitude"""
        spectral_type = spectral_type.lower()
        
        if 'c' in spectral_type or 'carbonaceous' in spectral_type:
            return 'carbonaceous'
        elif 's' in spectral_type or 'silicate' in spectral_type:
            return 'rock'
        elif 'm' in spectral_type or 'metal' in spectral_type:
            return 'iron'
        elif 'x' in spectral_type:
            return 'iron'  # X-type are often metallic
        else:
            # Default based on magnitude (brighter = more metallic)
            if absolute_magnitude < 15:
                return 'iron'
            elif absolute_magnitude < 20:
                return 'rock'
            else:
                return 'carbonaceous'
    
    def _get_fallback_asteroids(self) -> List[AsteroidData]:
        """Return well-known asteroids as fallback data"""
        fallback_asteroids = [
            AsteroidData(
                designation="433",
                name="Eros",
                diameter=16.84,
                diameter_uncertainty=0.5,
                mass=6.69e15,
                velocity=24.36,
                orbital_elements={
                    'semi_major_axis': 1.458,
                    'eccentricity': 0.223,
                    'inclination': 10.829,
                    'argument_of_perihelion': 178.664,
                    'longitude_of_ascending_node': 304.401,
                    'mean_anomaly': 0,
                    'period': 643.219
                },
                close_approach_data=[],
                is_potentially_hazardous=False,
                absolute_magnitude=11.16,
                albedo=0.25,
                spectral_type="S"
            ),
            AsteroidData(
                designation="99942",
                name="Apophis",
                diameter=0.37,
                diameter_uncertainty=0.05,
                mass=6.1e10,
                velocity=30.73,
                orbital_elements={
                    'semi_major_axis': 0.922,
                    'eccentricity': 0.191,
                    'inclination': 3.331,
                    'argument_of_perihelion': 126.404,
                    'longitude_of_ascending_node': 204.446,
                    'mean_anomaly': 0,
                    'period': 323.596
                },
                close_approach_data=[],
                is_potentially_hazardous=True,
                absolute_magnitude=19.7,
                albedo=0.23,
                spectral_type="S"
            ),
            AsteroidData(
                designation="101955",
                name="Bennu",
                diameter=0.492,
                diameter_uncertainty=0.02,
                mass=7.3e10,
                velocity=28.0,
                orbital_elements={
                    'semi_major_axis': 1.126,
                    'eccentricity': 0.204,
                    'inclination': 6.035,
                    'argument_of_perihelion': 66.223,
                    'longitude_of_ascending_node': 2.061,
                    'mean_anomaly': 0,
                    'period': 436.604
                },
                close_approach_data=[],
                is_potentially_hazardous=True,
                absolute_magnitude=20.12,
                albedo=0.046,
                spectral_type="B"
            ),
            AsteroidData(
                designation="25143",
                name="Itokawa",
                diameter=0.535,
                diameter_uncertainty=0.03,
                mass=3.5e10,
                velocity=29.73,
                orbital_elements={
                    'semi_major_axis': 1.324,
                    'eccentricity': 0.280,
                    'inclination': 1.621,
                    'argument_of_perihelion': 162.815,
                    'longitude_of_ascending_node': 69.095,
                    'mean_anomaly': 0,
                    'period': 556.355
                },
                close_approach_data=[],
                is_potentially_hazardous=False,
                absolute_magnitude=19.2,
                albedo=0.53,
                spectral_type="S"
            ),
            AsteroidData(
                designation="162173",
                name="Ryugu",
                diameter=0.866,
                diameter_uncertainty=0.02,
                mass=4.5e11,
                velocity=27.64,
                orbital_elements={
                    'semi_major_axis': 1.189,
                    'eccentricity': 0.190,
                    'inclination': 5.884,
                    'argument_of_perihelion': 211.446,
                    'longitude_of_ascending_node': 251.592,
                    'mean_anomaly': 0,
                    'period': 473.723
                },
                close_approach_data=[],
                is_potentially_hazardous=True,
                absolute_magnitude=19.25,
                albedo=0.047,
                spectral_type="C"
            )
        ]
        
        logger.info(f"Returning {len(fallback_asteroids)} fallback asteroids")
        return fallback_asteroids

class USGSSeismicService:
    """Service for USGS seismic data integration"""
    
    def __init__(self):
        self.base_url = "https://earthquake.usgs.gov/fdsnws/event/1"
    
    def get_earthquake_magnitude_energy_relation(self, magnitude: float) -> float:
        """Convert earthquake magnitude to energy using USGS relation"""
        # E = 10^(1.5M + 4.8) ergs
        energy_ergs = 10 ** (1.5 * magnitude + 4.8)
        energy_joules = energy_ergs / 1e7  # Convert ergs to joules
        return energy_joules
    
    def get_equivalent_magnitude(self, energy_joules: float) -> float:
        """Convert energy to equivalent earthquake magnitude using USGS relation"""
        # E = 10^(1.5M + 4.8) ergs
        # Solving for M: M = (log10(E) - 4.8) / 1.5
        energy_ergs = energy_joules * 1e7
        magnitude = (np.log10(energy_ergs) - 4.8) / 1.5
        return magnitude
    
    def get_earthquake_effects_at_distance(self, magnitude: float, distance_km: float) -> Dict:
        """Get earthquake effects at specific distance from impact"""
        # Use USGS ShakeMap methodology for ground motion prediction
        # Based on empirical relationships from real earthquake data
        
        # Peak Ground Acceleration (PGA) in g
        # Using Boore & Atkinson (2008) NGA-West1 relationship
        pga = 0.39 * np.exp(0.5 * magnitude - 0.0026 * distance_km - 2.0)
        pga = max(0.001, min(pga, 2.0))  # Clamp to reasonable range
        
        # Peak Ground Velocity (PGV) in cm/s
        pgv = 0.16 * np.exp(0.6 * magnitude - 0.003 * distance_km - 2.0)
        pgv = max(0.1, min(pgv, 200))  # Clamp to reasonable range
        
        # Modified Mercalli Intensity
        # Using Wald et al. (1999) relationship
        mmi = 3.66 + 1.66 * magnitude - 0.0003 * distance_km
        mmi = max(1.0, min(mmi, 12.0))  # Clamp to MMI scale
        
        # Damage assessment based on PGA
        damage_level = self._assess_damage_level(pga, mmi)
        
        # Seismic wave arrival times (approximate)
        p_wave_arrival = distance_km / 6.0  # P-waves travel ~6 km/s
        s_wave_arrival = distance_km / 3.5  # S-waves travel ~3.5 km/s
        
        return {
            'magnitude': magnitude,
            'distance_km': distance_km,
            'pga': pga,
            'pgv': pgv,
            'mmi': mmi,
            'damage_level': damage_level,
            'p_wave_arrival_seconds': p_wave_arrival,
            's_wave_arrival_seconds': s_wave_arrival,
            'felt_radius_km': self._calculate_felt_radius(magnitude)
        }
    
    def _assess_damage_level(self, pga: float, mmi: float) -> str:
        """Assess damage level based on PGA and MMI"""
        if mmi >= 10 or pga >= 1.0:
            return "Extreme damage - Most buildings destroyed"
        elif mmi >= 9 or pga >= 0.5:
            return "Severe damage - Many buildings severely damaged"
        elif mmi >= 8 or pga >= 0.2:
            return "Moderate damage - Some buildings damaged"
        elif mmi >= 7 or pga >= 0.1:
            return "Light damage - Minor damage to buildings"
        elif mmi >= 6 or pga >= 0.05:
            return "Slight damage - Some damage to poorly constructed buildings"
        elif mmi >= 5 or pga >= 0.02:
            return "Felt by all, some damage to poorly constructed buildings"
        elif mmi >= 4 or pga >= 0.01:
            return "Felt by many, no damage"
        else:
            return "Felt by few or no damage"
    
    def _calculate_felt_radius(self, magnitude: float) -> float:
        """Calculate radius where earthquake would be felt"""
        # Based on empirical relationships from historical earthquakes
        # Bakun & Wentworth (1997) relationship
        felt_radius = 10 ** (0.5 * magnitude - 2.0)
        return min(felt_radius, 10000)  # Cap at 10,000 km
    
    def get_ground_motion_parameters(self, magnitude: float, distance_km: float) -> Dict:
        """Get ground motion parameters for impact simulation"""
        # Simplified ground motion prediction
        # Based on USGS ShakeMap methodology
        
        # Peak Ground Acceleration (PGA) in g
        pga = 0.39 * np.exp(0.5 * magnitude - 0.0026 * distance_km - 2.0)
        pga = max(0.001, min(pga, 2.0))  # Clamp to reasonable range
        
        # Peak Ground Velocity (PGV) in cm/s
        pgv = 0.16 * np.exp(0.6 * magnitude - 0.003 * distance_km - 2.0)
        pgv = max(0.1, min(pgv, 200))  # Clamp to reasonable range
        
        # Modified Mercalli Intensity
        mmi = 3.66 + 1.66 * magnitude - 0.0003 * distance_km
        mmi = max(1.0, min(mmi, 12.0))  # Clamp to MMI scale
        
        return {
            'pga': pga,
            'pgv': pgv,
            'mmi': mmi,
            'distance_km': distance_km
        }
    
    def get_historical_earthquakes(self, magnitude_min: float = 5.0, 
                                 magnitude_max: float = 9.0) -> List[Dict]:
        """Get historical earthquakes for comparison"""
        try:
            url = f"{self.base_url}/query"
            params = {
                'format': 'geojson',
                'minmagnitude': magnitude_min,
                'maxmagnitude': magnitude_max,
                'limit': 100,
                'orderby': 'magnitude'
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            earthquakes = []
            for feature in data.get('features', []):
                props = feature.get('properties', {})
                geom = feature.get('geometry', {})
                
                earthquake = {
                    'magnitude': props.get('mag', 0),
                    'place': props.get('place', ''),
                    'time': props.get('time', 0),
                    'depth': props.get('depth', 0),
                    'longitude': geom.get('coordinates', [0, 0, 0])[0],
                    'latitude': geom.get('coordinates', [0, 0, 0])[1],
                    'energy_joules': self.get_earthquake_magnitude_energy_relation(props.get('mag', 0))
                }
                earthquakes.append(earthquake)
            
            return earthquakes
            
        except Exception as e:
            logger.error(f"Error fetching historical earthquakes: {e}")
            return []

class ImpactSimulationService:
    """Service for realistic impact simulation calculations"""
    
    def __init__(self, nasa_service: NASADataService, usgs_service: USGSSeismicService):
        self.nasa_service = nasa_service
        self.usgs_service = usgs_service
    
    def calculate_impact_energy(self, asteroid: AsteroidData, 
                              impact_velocity: float, impact_angle: float) -> float:
        """Calculate impact kinetic energy"""
        # Convert impact angle to radians
        angle_rad = np.radians(impact_angle)
        
        # Effective mass (reduced by impact angle)
        effective_mass = asteroid.mass * np.sin(angle_rad)
        
        # Kinetic energy: KE = 0.5 * m * v^2
        kinetic_energy = 0.5 * effective_mass * (impact_velocity * 1000) ** 2  # Convert km/s to m/s
        
        return kinetic_energy
    
    def calculate_crater_dimensions(self, energy_joules: float, 
                                  target_density: float = 2700) -> Dict:
        """Calculate crater dimensions based on impact energy"""
        # Crater scaling laws based on experimental data
        
        # Convert energy to equivalent TNT
        tnt_equivalent = energy_joules / 4.184e9  # 1 ton TNT = 4.184 GJ
        
        # Simple crater diameter (km) - based on experimental scaling
        diameter_simple = 1.2 * (tnt_equivalent / 1e6) ** 0.294
        
        # Complex crater diameter (km) - for larger impacts
        diameter_complex = 1.8 * (tnt_equivalent / 1e6) ** 0.294
        
        # Use simple crater for smaller impacts, complex for larger
        if tnt_equivalent < 1e6:  # Less than 1 megaton
            diameter = diameter_simple
            depth = diameter / 5.0  # Simple crater depth/diameter ratio
        else:
            diameter = diameter_complex
            depth = diameter / 10.0  # Complex crater depth/diameter ratio
        
        return {
            'diameter_km': diameter,
            'depth_km': depth,
            'volume_km3': np.pi * (diameter/2)**2 * depth,
            'tnt_equivalent_megatons': tnt_equivalent / 1e6
        }
    
    def calculate_blast_effects(self, energy_joules: float, 
                              distance_km: float) -> Dict:
        """Calculate blast effects at given distance"""
        tnt_equivalent = energy_joules / 4.184e9
        
        # Overpressure (kPa) - based on nuclear explosion scaling
        overpressure = 1000 * (tnt_equivalent ** (1/3)) / (distance_km ** 2)
        
        # Thermal radiation (cal/cm²) - simplified
        thermal_flux = 1000 * (tnt_equivalent ** (1/3)) / (distance_km ** 2)
        
        # Damage levels based on overpressure
        if overpressure > 200:
            damage_level = "Complete destruction"
        elif overpressure > 100:
            damage_level = "Severe damage"
        elif overpressure > 50:
            damage_level = "Moderate damage"
        elif overpressure > 20:
            damage_level = "Light damage"
        else:
            damage_level = "No significant damage"
        
        return {
            'overpressure_kpa': overpressure,
            'thermal_flux_cal_cm2': thermal_flux,
            'damage_level': damage_level,
            'distance_km': distance_km
        }
    
    def calculate_tsunami_effects(self, energy_joules: float, 
                                water_depth_m: float, distance_km: float) -> Dict:
        """Calculate tsunami effects for oceanic impacts"""
        tnt_equivalent = energy_joules / 4.184e9
        
        # Initial wave height (m) - simplified model
        initial_height = 0.5 * (tnt_equivalent ** (1/3)) * (water_depth_m ** (-1/4))
        
        # Wave height at coast (m) - considering shoaling
        coastal_height = initial_height * np.exp(-distance_km / 1000)  # Exponential decay
        
        # Inundation distance (km) - based on coastal height
        inundation_distance = 2.0 * coastal_height  # Simplified relationship
        
        return {
            'initial_wave_height_m': initial_height,
            'coastal_wave_height_m': coastal_height,
            'inundation_distance_km': inundation_distance,
            'tsunami_arrival_time_min': distance_km / 500  # Average tsunami speed
        }
    
    def simulate_full_impact(self, asteroid: AsteroidData, impact_params: ImpactParameters) -> Dict:
        """Simulate complete impact scenario"""
        # Calculate impact energy
        energy = self.calculate_impact_energy(asteroid, impact_params.impact_velocity, 
                                            impact_params.impact_angle)
        
        # Calculate crater dimensions
        crater = self.calculate_crater_dimensions(energy)
        
        # Calculate seismic effects
        magnitude = self.usgs_service.get_equivalent_magnitude(energy)
        seismic = self.usgs_service.get_earthquake_effects_at_distance(magnitude, 0)  # At impact site
        
        # Calculate seismic effects at various distances
        seismic_effects = {}
        for distance in [10, 50, 100, 500, 1000, 2000]:  # km
            seismic_effects[f'{distance}km'] = self.usgs_service.get_earthquake_effects_at_distance(magnitude, distance)
        
        # Calculate blast effects at various distances
        blast_effects = {}
        for distance in [10, 50, 100, 500, 1000]:  # km
            blast_effects[f'{distance}km'] = self.calculate_blast_effects(energy, distance)
        
        # Calculate tsunami effects if oceanic impact
        tsunami_effects = None
        if impact_params.target_material == 'water':
            tsunami_effects = self.calculate_tsunami_effects(energy, 4000, 1000)  # Deep ocean, 1000km to coast
        
        return {
            'asteroid': {
                'name': asteroid.name,
                'diameter_km': asteroid.diameter,
                'mass_kg': asteroid.mass,
                'velocity_km_s': impact_params.impact_velocity,
                'impact_angle_deg': impact_params.impact_angle
            },
            'energy': {
                'kinetic_energy_joules': energy,
                'tnt_equivalent_megatons': crater['tnt_equivalent_megatons'],
                'equivalent_magnitude': magnitude
            },
            'crater': crater,
            'seismic': seismic,
            'seismic_effects': seismic_effects,
            'blast_effects': blast_effects,
            'tsunami_effects': tsunami_effects,
            'impact_location': {
                'latitude': impact_params.impact_location[0],
                'longitude': impact_params.impact_location[1],
                'target_material': impact_params.target_material
            }
        }
