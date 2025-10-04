# Game Engine for Asteroid Defense Simulation
import numpy as np
import math
import time
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

from ..calculations.impact_physics import (
    calculate_kinetic_energy, energy_to_tnt_equivalent, 
    calculate_crater_diameter, estimate_devastation_radius,
    calculate_mass_from_diameter, calculate_impact_velocity
)
from ..calculations.orbital_mechanics import (
    calculate_orbital_position, calculate_trajectory,
    calculate_earth_intersection, apply_velocity_change
)
from ..calculations.mitigation import (
    calculate_kinetic_impactor_deflection,
    calculate_gravity_tractor_deflection,
    calculate_laser_ablation_deflection
)
from ..utils.constants import GAME_LEVELS, BASE_SCORE, TIME_BONUS_MULTIPLIER

class GameState(Enum):
    MENU = "menu"
    PLAYING = "playing"
    PAUSED = "paused"
    GAME_OVER = "game_over"
    VICTORY = "victory"

class DefenseStrategy(Enum):
    KINETIC_IMPACTOR = "kinetic"
    GRAVITY_TRACTOR = "gravity"
    LASER_ABLATION = "laser"

@dataclass
class Asteroid:
    """Asteroid object with physical properties"""
    name: str
    diameter: float  # km
    velocity: float  # km/s
    density: float = 3000  # kg/m³
    orbital_elements: Dict = None
    position: Tuple[float, float, float] = (0, 0, 0)
    
    def __post_init__(self):
        self.mass = calculate_mass_from_diameter(self.diameter, self.density)
        self.orbital_elements = self.orbital_elements or self._default_orbital_elements()
    
    def _default_orbital_elements(self):
        return {
            'semi_major_axis': 1.5,  # AU
            'eccentricity': 0.3,
            'inclination': 15.0,  # degrees
            'argument_of_perihelion': 0.0,
            'longitude_of_ascending_node': 0.0
        }

@dataclass
class ImpactResult:
    """Result of asteroid impact simulation"""
    energy_joules: float
    tnt_equivalent: float
    crater_diameter: float
    devastation_radius: Dict[str, float]
    impact_point: Dict[str, float]
    environmental_effects: Dict[str, any]

@dataclass
class DefenseResult:
    """Result of defense strategy simulation"""
    success: bool
    deflection_percentage: float
    new_miss_distance: float
    time_to_impact: float
    strategy_used: DefenseStrategy

class GameEngine:
    """Main game engine for asteroid defense simulation"""
    
    def __init__(self):
        self.state = GameState.MENU
        self.level = 1
        self.score = 0
        self.time_remaining = 0
        self.asteroid = None
        self.defense_systems = []
        self.simulation_time = 0
        self.game_start_time = None
        
    def start_game(self, level: int = 1) -> Dict:
        """Start a new game at specified level"""
        if level not in GAME_LEVELS:
            raise ValueError(f"Invalid level: {level}")
        
        self.level = level
        self.state = GameState.PLAYING
        self.score = 0
        self.simulation_time = 0
        self.game_start_time = time.time()
        
        # Create asteroid based on level
        level_config = GAME_LEVELS[level]
        self.asteroid = self._create_asteroid_for_level(level_config)
        self.time_remaining = level_config['time_limit']
        
        return {
            'level': self.level,
            'asteroid': self._asteroid_to_dict(),
            'time_remaining': self.time_remaining,
            'difficulty': level_config['difficulty']
        }
    
    def _create_asteroid_for_level(self, level_config: Dict) -> Asteroid:
        """Create asteroid with properties based on level"""
        size = level_config['asteroid_size']
        
        # Generate realistic asteroid properties
        diameter = size / 1000  # Convert to km
        velocity = np.random.uniform(10, 20)  # km/s
        density = np.random.uniform(2000, 4000)  # kg/m³
        
        return Asteroid(
            name=f"Threat-{self.level}",
            diameter=diameter,
            velocity=velocity,
            density=density
        )
    
    def simulate_impact(self, impact_angle: float = 45.0) -> ImpactResult:
        """Simulate asteroid impact and calculate effects"""
        if not self.asteroid:
            raise ValueError("No asteroid loaded")
        
        # Calculate impact physics
        energy = calculate_kinetic_energy(self.asteroid.mass, self.asteroid.velocity)
        tnt_equivalent = energy_to_tnt_equivalent(energy)
        crater_diameter = calculate_crater_diameter(energy, impact_angle)
        devastation = estimate_devastation_radius(crater_diameter, tnt_equivalent)
        
        # Calculate impact point (simplified)
        impact_point = self._calculate_impact_point()
        
        # Calculate environmental effects
        environmental_effects = self._calculate_environmental_effects(
            energy, crater_diameter, tnt_equivalent
        )
        
        return ImpactResult(
            energy_joules=energy,
            tnt_equivalent=tnt_equivalent,
            crater_diameter=crater_diameter,
            devastation_radius=devastation,
            impact_point=impact_point,
            environmental_effects=environmental_effects
        )
    
    def attempt_deflection(self, strategy: DefenseStrategy, 
                          deflection_force: float = 1.0) -> DefenseResult:
        """Attempt to deflect asteroid using specified strategy"""
        if not self.asteroid:
            raise ValueError("No asteroid loaded")
        
        # Calculate deflection based on strategy
        if strategy == DefenseStrategy.KINETIC_IMPACTOR:
            deflection_percentage = calculate_kinetic_impactor_deflection(
                self.asteroid.mass, deflection_force
            )
        elif strategy == DefenseStrategy.GRAVITY_TRACTOR:
            deflection_percentage = calculate_gravity_tractor_deflection(
                self.asteroid.mass, deflection_force
            )
        elif strategy == DefenseStrategy.LASER_ABLATION:
            deflection_percentage = calculate_laser_ablation_deflection(
                self.asteroid.mass, deflection_force
            )
        else:
            raise ValueError(f"Unknown strategy: {strategy}")
        
        # Calculate new trajectory
        new_elements = apply_velocity_change(
            self.asteroid, 
            (deflection_force * 0.1, 0, 0)  # Simplified delta-v
        )
        
        # Check if deflection is successful
        success = deflection_percentage > 0.1  # 10% minimum deflection
        new_miss_distance = self._calculate_miss_distance(deflection_percentage)
        time_to_impact = self._calculate_time_to_impact()
        
        # Update score based on deflection success
        if success:
            self.score += self._calculate_deflection_score(deflection_percentage)
        
        return DefenseResult(
            success=success,
            deflection_percentage=deflection_percentage,
            new_miss_distance=new_miss_distance,
            time_to_impact=time_to_impact,
            strategy_used=strategy
        )
    
    def update_game_state(self, delta_time: float) -> Dict:
        """Update game state based on elapsed time"""
        if self.state != GameState.PLAYING:
            return {'state': self.state.value}
        
        self.simulation_time += delta_time
        self.time_remaining -= delta_time
        
        # Check for game over conditions
        if self.time_remaining <= 0:
            self.state = GameState.GAME_OVER
            return {
                'state': self.state.value,
                'score': self.score,
                'reason': 'time_up'
            }
        
        # Update asteroid position
        if self.asteroid:
            self._update_asteroid_position(delta_time)
            
            # Check for impact
            if self._check_impact():
                self.state = GameState.GAME_OVER
                return {
                    'state': self.state.value,
                    'score': self.score,
                    'reason': 'impact'
                }
        
        return {
            'state': self.state.value,
            'time_remaining': self.time_remaining,
            'score': self.score,
            'asteroid_position': self.asteroid.position if self.asteroid else None
        }
    
    def pause_game(self):
        """Pause the game"""
        if self.state == GameState.PLAYING:
            self.state = GameState.PAUSED
    
    def resume_game(self):
        """Resume the game"""
        if self.state == GameState.PAUSED:
            self.state = GameState.PLAYING
    
    def reset_game(self):
        """Reset game to initial state"""
        self.state = GameState.MENU
        self.level = 1
        self.score = 0
        self.time_remaining = 0
        self.asteroid = None
        self.simulation_time = 0
        self.game_start_time = None
    
    def get_game_status(self) -> Dict:
        """Get current game status"""
        return {
            'state': self.state.value,
            'level': self.level,
            'score': self.score,
            'time_remaining': self.time_remaining,
            'asteroid': self._asteroid_to_dict() if self.asteroid else None
        }
    
    def _asteroid_to_dict(self) -> Dict:
        """Convert asteroid to dictionary for API response"""
        if not self.asteroid:
            return None
        
        return {
            'name': self.asteroid.name,
            'diameter': self.asteroid.diameter,
            'velocity': self.asteroid.velocity,
            'mass': self.asteroid.mass,
            'position': self.asteroid.position
        }
    
    def _calculate_impact_point(self) -> Dict[str, float]:
        """Calculate impact point on Earth (simplified)"""
        # Random impact point for now
        lat = np.random.uniform(-90, 90)
        lon = np.random.uniform(-180, 180)
        return {'lat': lat, 'lon': lon}
    
    def _calculate_environmental_effects(self, energy: float, 
                                       crater_diameter: float, 
                                       tnt_equivalent: float) -> Dict:
        """Calculate environmental effects of impact"""
        return {
            'tsunami_risk': 'High' if tnt_equivalent > 1 else 'Low',
            'seismic_magnitude': 6.0 + np.log10(tnt_equivalent),
            'atmospheric_dust': tnt_equivalent * 1000,  # tons
            'climate_impact': 'Severe' if tnt_equivalent > 10 else 'Moderate'
        }
    
    def _calculate_miss_distance(self, deflection_percentage: float) -> float:
        """Calculate new miss distance after deflection"""
        # Simplified calculation
        base_distance = 1000  # km
        return base_distance * deflection_percentage
    
    def _calculate_time_to_impact(self) -> float:
        """Calculate time remaining until impact"""
        if not self.asteroid:
            return 0
        
        # Simplified calculation based on velocity and distance
        distance = np.linalg.norm(self.asteroid.position)
        return distance / self.asteroid.velocity if self.asteroid.velocity > 0 else 0
    
    def _calculate_deflection_score(self, deflection_percentage: float) -> int:
        """Calculate score bonus for successful deflection"""
        base_bonus = BASE_SCORE
        efficiency_bonus = deflection_percentage * 1000
        return int(base_bonus + efficiency_bonus)
    
    def _update_asteroid_position(self, delta_time: float):
        """Update asteroid position based on orbital mechanics"""
        if not self.asteroid:
            return
        
        # Simplified position update
        # In reality, this would use proper orbital mechanics
        velocity_factor = self.asteroid.velocity * delta_time / 86400  # Convert to km/day
        self.asteroid.position = (
            self.asteroid.position[0] - velocity_factor,
            self.asteroid.position[1],
            self.asteroid.position[2] - velocity_factor * 0.1
        )
    
    def _check_impact(self) -> bool:
        """Check if asteroid has impacted Earth"""
        if not self.asteroid:
            return False
        
        # Check if asteroid is within Earth's radius
        distance = np.linalg.norm(self.asteroid.position)
        return distance < 6371  # Earth radius in km

# Global game engine instance
game_engine = GameEngine()
