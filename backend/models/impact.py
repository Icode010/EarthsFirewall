from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import math

@dataclass
class ImpactSimulation:
    """Represents an asteroid impact simulation result"""
    
    # Asteroid data
    asteroid_name: str
    asteroid_diameter: float  # km
    asteroid_mass: float  # kg
    asteroid_velocity: float  # km/s
    
    # Impact parameters
    impact_angle: float  # degrees
    impact_location: Tuple[float, float]  # lat, lon
    target_material: str  # rock, water, ice
    
    # Impact results
    kinetic_energy: float  # joules
    tnt_equivalent: float  # megatons
    equivalent_magnitude: float  # earthquake magnitude
    
    # Crater formation
    crater_diameter: float  # km
    crater_depth: float  # km
    crater_volume: float  # km³
    
    # Environmental effects
    blast_effects: Dict
    seismic_effects: Dict
    tsunami_effects: Optional[Dict] = None
    
    # Timestamp
    simulation_timestamp: Optional[str] = None
    
    def calculate_impact_energy(self, mass: float, velocity: float, angle: float) -> float:
        """Calculate kinetic energy of impact"""
        angle_rad = math.radians(angle)
        effective_mass = mass * math.sin(angle_rad)
        velocity_ms = velocity * 1000  # Convert km/s to m/s
        return 0.5 * effective_mass * (velocity_ms ** 2)
    
    def energy_to_tnt_equivalent(self, energy_joules: float) -> float:
        """Convert energy to TNT equivalent in megatons"""
        return energy_joules / (4.184e15)  # 1 MT TNT = 4.184e15 J
    
    def energy_to_magnitude(self, energy_joules: float) -> float:
        """Convert energy to equivalent earthquake magnitude"""
        if energy_joules <= 0:
            return 0
        return (math.log10(energy_joules) - 4.8) / 1.5
    
    def calculate_crater_dimensions(self, energy_joules: float) -> Dict:
        """Calculate crater dimensions based on impact energy"""
        tnt_equivalent = self.energy_to_tnt_equivalent(energy_joules)
        
        # Crater scaling laws (simplified)
        if tnt_equivalent < 1e6:  # Less than 1 megaton
            diameter = 1.2 * (tnt_equivalent ** 0.294)
            depth = diameter / 5.0
        else:
            diameter = 1.8 * (tnt_equivalent ** 0.294)
            depth = diameter / 10.0
        
        volume = math.pi * (diameter/2)**2 * depth
        
        return {
            'diameter_km': diameter,
            'depth_km': depth,
            'volume_km3': volume,
            'tnt_equivalent_megatons': tnt_equivalent
        }
    
    def calculate_blast_effects(self, energy_joules: float, distances: List[float]) -> Dict:
        """Calculate blast effects at various distances"""
        tnt_equivalent = self.energy_to_tnt_equivalent(energy_joules)
        blast_effects = {}
        
        for distance in distances:
            # Overpressure calculation (simplified)
            overpressure = 1000 * (tnt_equivalent ** (1/3)) / (distance ** 2)
            
            # Damage level based on overpressure
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
            
            blast_effects[f'{distance}km'] = {
                'overpressure_kpa': overpressure,
                'damage_level': damage_level,
                'distance_km': distance
            }
        
        return blast_effects
    
    def calculate_seismic_effects(self, magnitude: float) -> Dict:
        """Calculate seismic effects"""
        # Ground motion parameters (simplified)
        pga = 0.39 * math.exp(0.5 * magnitude - 2.0)  # Peak Ground Acceleration
        pga = max(0.001, min(pga, 2.0))  # Clamp to reasonable range
        
        pgv = 0.16 * math.exp(0.6 * magnitude - 2.0)  # Peak Ground Velocity
        pgv = max(0.1, min(pgv, 200))
        
        mmi = 3.66 + 1.66 * magnitude  # Modified Mercalli Intensity
        mmi = max(1.0, min(mmi, 12.0))
        
        return {
            'pga': pga,
            'pgv': pgv,
            'mmi': mmi,
            'magnitude': magnitude
        }
    
    def calculate_tsunami_effects(self, energy_joules: float, water_depth: float = 4000, distance_to_coast: float = 1000) -> Dict:
        """Calculate tsunami effects for oceanic impacts"""
        if self.target_material != 'water':
            return None
        
        tnt_equivalent = self.energy_to_tnt_equivalent(energy_joules)
        
        # Initial wave height (simplified model)
        initial_height = 0.5 * (tnt_equivalent ** (1/3)) * (water_depth ** (-1/4))
        
        # Wave height at coast (exponential decay)
        coastal_height = initial_height * math.exp(-distance_to_coast / 1000)
        
        # Inundation distance (simplified)
        inundation_distance = 2.0 * coastal_height
        
        return {
            'initial_wave_height_m': initial_height,
            'coastal_wave_height_m': coastal_height,
            'inundation_distance_km': inundation_distance,
            'tsunami_arrival_time_min': distance_to_coast / 500  # Average tsunami speed
        }
    
    def to_dict(self) -> Dict:
        """Convert simulation to dictionary"""
        return {
            'asteroid': {
                'name': self.asteroid_name,
                'diameter_km': self.asteroid_diameter,
                'mass_kg': self.asteroid_mass,
                'velocity_km_s': self.asteroid_velocity
            },
            'impact_parameters': {
                'angle_degrees': self.impact_angle,
                'location': {
                    'latitude': self.impact_location[0],
                    'longitude': self.impact_location[1]
                },
                'target_material': self.target_material
            },
            'results': {
                'kinetic_energy_joules': self.kinetic_energy,
                'tnt_equivalent_megatons': self.tnt_equivalent,
                'equivalent_magnitude': self.equivalent_magnitude
            },
            'crater': {
                'diameter_km': self.crater_diameter,
                'depth_km': self.crater_depth,
                'volume_km3': self.crater_volume
            },
            'blast_effects': self.blast_effects,
            'seismic_effects': self.seismic_effects,
            'tsunami_effects': self.tsunami_effects,
            'simulation_timestamp': self.simulation_timestamp
        }
    
    @classmethod
    def from_simulation_data(cls, simulation_data: Dict) -> 'ImpactSimulation':
        """Create ImpactSimulation from simulation data"""
        asteroid = simulation_data['asteroid']
        energy = simulation_data['energy']
        crater = simulation_data['crater']
        seismic = simulation_data['seismic']
        blast = simulation_data['blast_effects']
        tsunami = simulation_data.get('tsunami_effects')
        
        return cls(
            asteroid_name=asteroid['name'],
            asteroid_diameter=asteroid['diameter_km'],
            asteroid_mass=asteroid['mass_kg'],
            asteroid_velocity=asteroid['velocity_km_s'],
            impact_angle=asteroid['impact_angle_deg'],
            impact_location=tuple(simulation_data['impact_location'].values()),
            target_material=simulation_data['impact_location']['target_material'],
            kinetic_energy=energy['kinetic_energy_joules'],
            tnt_equivalent=energy['tnt_equivalent_megatons'],
            equivalent_magnitude=energy['equivalent_magnitude'],
            crater_diameter=crater['diameter_km'],
            crater_depth=crater['depth_km'],
            crater_volume=crater['volume_km3'],
            blast_effects=blast,
            seismic_effects=seismic,
            tsunami_effects=tsunami
        )
    
    def __str__(self):
        return f"ImpactSimulation: {self.asteroid_name} -> {self.tnt_equivalent:.2f} MT"
    
    def __repr__(self):
        return f"ImpactSimulation(asteroid='{self.asteroid_name}', energy={self.tnt_equivalent:.2f}MT)"