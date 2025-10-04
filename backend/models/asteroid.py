from dataclasses import dataclass
from typing import Dict, List, Optional
import math

@dataclass
class Asteroid:
    """Represents an asteroid with physical and orbital properties"""
    
    # Basic identification
    designation: str
    name: Optional[str] = None
    
    # Physical properties
    diameter: float = 0.0  # km
    mass: float = 0.0  # kg
    density: float = 0.0  # kg/m³
    albedo: float = 0.0  # reflectivity (0-1)
    spectral_type: str = "unknown"
    absolute_magnitude: float = 0.0
    velocity: float = 30.0  # km/s (default impact velocity)
    
    # Orbital elements (at epoch)
    orbital_elements: Dict = None
    
    # Risk assessment
    is_potentially_hazardous: bool = False
    minimum_orbit_intersection_distance: float = 0.0  # AU
    
    # Close approach data
    close_approach_data: List[Dict] = None
    
    def __post_init__(self):
        if self.close_approach_data is None:
            self.close_approach_data = []
        if self.orbital_elements is None:
            self.orbital_elements = {
                'semi_major_axis': 0.0,
                'eccentricity': 0.0,
                'inclination': 0.0,
                'longitude_of_ascending_node': 0.0,
                'argument_of_perihelion': 0.0,
                'mean_anomaly': 0.0,
                'period': 0.0
            }
    
    @property
    def semi_major_axis(self) -> float:
        return self.orbital_elements.get('semi_major_axis', 0.0)
    
    @property
    def eccentricity(self) -> float:
        return self.orbital_elements.get('eccentricity', 0.0)
    
    @property
    def inclination(self) -> float:
        return self.orbital_elements.get('inclination', 0.0)
    
    @property
    def longitude_of_ascending_node(self) -> float:
        return self.orbital_elements.get('longitude_of_ascending_node', 0.0)
    
    @property
    def argument_of_perihelion(self) -> float:
        return self.orbital_elements.get('argument_of_perihelion', 0.0)
    
    @property
    def mean_anomaly(self) -> float:
        return self.orbital_elements.get('mean_anomaly', 0.0)
    
    @property
    def period(self) -> float:
        return self.orbital_elements.get('period', 0.0)
    
    def calculate_mass_from_diameter(self, density: float = 2000.0) -> float:
        """Calculate mass from diameter assuming spherical shape"""
        if self.diameter <= 0:
            return 0.0
        
        # Volume in m³
        radius_m = (self.diameter * 1000) / 2  # Convert km to m
        volume = (4/3) * math.pi * (radius_m ** 3)
        
        # Mass = density × volume
        self.mass = density * volume
        self.density = density
        return self.mass
    
    def calculate_orbital_velocity(self, distance_from_sun: float = 1.0) -> float:
        """Calculate orbital velocity at given distance from Sun (AU)"""
        if self.semi_major_axis <= 0:
            return 0.0
        
        # Convert AU to meters
        distance_m = distance_from_sun * 1.496e11
        
        # Standard gravitational parameter for Sun (m³/s²)
        mu_sun = 1.327e20
        
        # Orbital velocity = sqrt(GM/r)
        velocity = math.sqrt(mu_sun / distance_m)
        
        return velocity / 1000  # Convert to km/s
    
    def get_impact_velocity_at_earth(self) -> float:
        """Estimate impact velocity at Earth encounter"""
        # Earth's orbital velocity (km/s)
        earth_velocity = 29.8
        
        # Asteroid velocity at Earth's distance (km/s)
        asteroid_velocity = self.calculate_orbital_velocity(1.0)
        
        # Simplified impact velocity (relative velocity + escape velocity)
        # This is a rough approximation
        impact_velocity = math.sqrt(asteroid_velocity**2 + earth_velocity**2 + 11.2**2)
        
        return impact_velocity
    
    def calculate_kinetic_energy_at_impact(self) -> float:
        """Calculate kinetic energy at impact (Joules)"""
        impact_velocity = self.get_impact_velocity_at_earth()
        
        # KE = 0.5 * m * v²
        kinetic_energy = 0.5 * self.mass * (impact_velocity * 1000)**2
        
        return kinetic_energy
    
    def get_orbital_period(self) -> float:
        """Calculate orbital period using Kepler's third law"""
        if self.semi_major_axis <= 0:
            return 0.0
        
        # Kepler's third law: T² = (4π²a³) / (GM)
        # Using AU and years for convenience
        G = 4.0 * math.pi**2  # AU³/year²
        M_sun = 1.0  # Solar mass
        
        period_squared = (4 * math.pi**2 * self.semi_major_axis**3) / (G * M_sun)
        period_years = math.sqrt(period_squared)
        period_days = period_years * 365.25
        
        return period_days
    
    def to_dict(self) -> Dict:
        """Convert asteroid to dictionary"""
        return {
            'designation': self.designation,
            'name': self.name,
            'diameter_km': self.diameter,
            'mass_kg': self.mass,
            'density_kg_m3': self.density,
            'albedo': self.albedo,
            'spectral_type': self.spectral_type,
            'absolute_magnitude': self.absolute_magnitude,
            'velocity_km_s': self.velocity,
            'orbital_elements': self.orbital_elements,
            'is_potentially_hazardous': self.is_potentially_hazardous,
            'minimum_orbit_intersection_distance': self.minimum_orbit_intersection_distance,
            'close_approach_data': self.close_approach_data
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Asteroid':
        """Create asteroid from dictionary"""
        return cls(
            designation=data.get('designation', ''),
            name=data.get('name'),
            diameter=data.get('diameter_km', data.get('diameter', 0.0)),
            mass=data.get('mass_kg', data.get('mass', 0.0)),
            density=data.get('density_kg_m3', data.get('density', 0.0)),
            albedo=data.get('albedo', 0.0),
            spectral_type=data.get('spectral_type', 'unknown'),
            absolute_magnitude=data.get('absolute_magnitude', 0.0),
            velocity=data.get('velocity_km_s', data.get('velocity', 30.0)),
            orbital_elements=data.get('orbital_elements', {}),
            is_potentially_hazardous=data.get('is_potentially_hazardous', False),
            minimum_orbit_intersection_distance=data.get('minimum_orbit_intersection_distance', 0.0),
            close_approach_data=data.get('close_approach_data', [])
        )
    
    def __str__(self):
        return f"Asteroid {self.name} ({self.designation}) - Diameter: {self.diameter} km"
    
    def __repr__(self):
        return f"Asteroid(designation='{self.designation}', name='{self.name}', diameter={self.diameter})"