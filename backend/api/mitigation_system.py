"""
Asteroid Mitigation System
Implements realistic deflection and mitigation strategies based on NASA DART mission
and other planetary defense technologies
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class MitigationMission:
    """Mitigation mission parameters"""
    mission_type: str  # kinetic_impactor, gravity_tractor, ion_beam, nuclear
    spacecraft_mass: float  # kg
    approach_velocity: float  # km/s
    deflection_time: float  # years before impact
    target_asteroid: str
    effectiveness_factor: float  # 0.0 to 1.0

@dataclass
class DeflectionResult:
    """Result of deflection attempt"""
    success: bool
    velocity_change: float  # m/s
    orbital_change: Dict
    deflection_distance: float  # km at Earth encounter
    confidence_level: float  # 0.0 to 1.0
    mission_cost: float  # USD
    mission_duration: float  # years

class MitigationSystem:
    """System for calculating asteroid deflection and mitigation strategies"""
    
    def __init__(self):
        self.gravitational_constant = 6.67430e-11  # m³/kg/s²
        self.earth_mass = 5.972e24  # kg
        self.sun_mass = 1.989e30  # kg
        self.au_to_meters = 1.496e11  # meters
        
    def calculate_kinetic_impactor_deflection(self, asteroid_mass: float,
                                            spacecraft_mass: float,
                                            approach_velocity: float,
                                            deflection_time: float,
                                            impact_velocity: float) -> DeflectionResult:
        """
        Calculate deflection using kinetic impactor (DART-style mission)
        Based on NASA DART mission results and momentum transfer theory
        """
        try:
            # Momentum transfer efficiency (DART achieved ~3.5x)
            momentum_transfer_efficiency = 3.5
            
            # Calculate momentum change
            momentum_change = spacecraft_mass * approach_velocity * momentum_transfer_efficiency
            
            # Calculate velocity change
            velocity_change = momentum_change / asteroid_mass
            
            # Calculate orbital deflection over time
            orbital_deflection = self._calculate_orbital_deflection(
                velocity_change, deflection_time, impact_velocity
            )
            
            # Calculate deflection distance at Earth encounter
            deflection_distance = orbital_deflection['deflection_distance']
            
            # Mission parameters
            mission_cost = self._estimate_kinetic_impactor_cost(spacecraft_mass, deflection_time)
            mission_duration = deflection_time
            
            # Success criteria: deflect by more than Earth's radius (6371 km)
            success = deflection_distance > 6371
            
            # Confidence based on mission complexity and time
            confidence = min(0.95, 0.5 + 0.1 * deflection_time)
            
            return DeflectionResult(
                success=success,
                velocity_change=velocity_change,
                orbital_change=orbital_deflection,
                deflection_distance=deflection_distance,
                confidence_level=confidence,
                mission_cost=mission_cost,
                mission_duration=mission_duration
            )
            
        except Exception as e:
            logger.error(f"Error calculating kinetic impactor deflection: {e}")
            return DeflectionResult(
                success=False,
                velocity_change=0,
                orbital_change={},
                deflection_distance=0,
                confidence_level=0,
                mission_cost=0,
                mission_duration=0
            )
    
    def calculate_gravity_tractor_deflection(self, asteroid_mass: float,
                                           spacecraft_mass: float,
                                           hover_distance: float,
                                           deflection_time: float,
                                           impact_velocity: float) -> DeflectionResult:
        """
        Calculate deflection using gravity tractor method
        Uses gravitational attraction to slowly pull asteroid
        """
        try:
            # Calculate gravitational force between spacecraft and asteroid
            gravitational_force = (self.gravitational_constant * 
                                 spacecraft_mass * asteroid_mass / 
                                 (hover_distance ** 2))
            
            # Calculate acceleration on asteroid
            asteroid_acceleration = gravitational_force / asteroid_mass
            
            # Calculate velocity change over time
            velocity_change = asteroid_acceleration * (deflection_time * 365.25 * 24 * 3600)
            
            # Calculate orbital deflection
            orbital_deflection = self._calculate_orbital_deflection(
                velocity_change, deflection_time, impact_velocity
            )
            
            deflection_distance = orbital_deflection['deflection_distance']
            
            # Mission parameters
            mission_cost = self._estimate_gravity_tractor_cost(spacecraft_mass, deflection_time)
            mission_duration = deflection_time
            
            # Success criteria
            success = deflection_distance > 6371
            
            # Lower confidence due to complexity and long duration
            confidence = min(0.8, 0.3 + 0.05 * deflection_time)
            
            return DeflectionResult(
                success=success,
                velocity_change=velocity_change,
                orbital_change=orbital_deflection,
                deflection_distance=deflection_distance,
                confidence_level=confidence,
                mission_cost=mission_cost,
                mission_duration=mission_duration
            )
            
        except Exception as e:
            logger.error(f"Error calculating gravity tractor deflection: {e}")
            return DeflectionResult(
                success=False,
                velocity_change=0,
                orbital_change={},
                deflection_distance=0,
                confidence_level=0,
                mission_cost=0,
                mission_duration=0
            )
    
    def calculate_ion_beam_deflection(self, asteroid_mass: float,
                                    ion_beam_thrust: float,
                                    deflection_time: float,
                                    impact_velocity: float) -> DeflectionResult:
        """
        Calculate deflection using ion beam shepherd
        Continuous low-thrust deflection
        """
        try:
            # Calculate total impulse
            total_impulse = ion_beam_thrust * (deflection_time * 365.25 * 24 * 3600)
            
            # Calculate velocity change
            velocity_change = total_impulse / asteroid_mass
            
            # Calculate orbital deflection
            orbital_deflection = self._calculate_orbital_deflection(
                velocity_change, deflection_time, impact_velocity
            )
            
            deflection_distance = orbital_deflection['deflection_distance']
            
            # Mission parameters
            mission_cost = self._estimate_ion_beam_cost(ion_beam_thrust, deflection_time)
            mission_duration = deflection_time
            
            # Success criteria
            success = deflection_distance > 6371
            
            # High confidence due to continuous control
            confidence = min(0.9, 0.6 + 0.1 * deflection_time)
            
            return DeflectionResult(
                success=success,
                velocity_change=velocity_change,
                orbital_change=orbital_deflection,
                deflection_distance=deflection_distance,
                confidence_level=confidence,
                mission_cost=mission_cost,
                mission_duration=mission_duration
            )
            
        except Exception as e:
            logger.error(f"Error calculating ion beam deflection: {e}")
            return DeflectionResult(
                success=False,
                velocity_change=0,
                orbital_change={},
                deflection_distance=0,
                confidence_level=0,
                mission_cost=0,
                mission_duration=0
            )
    
    def calculate_nuclear_deflection(self, asteroid_mass: float,
                                   nuclear_yield_megatons: float,
                                   detonation_distance: float,
                                   deflection_time: float,
                                   impact_velocity: float) -> DeflectionResult:
        """
        Calculate deflection using nuclear explosive device
        Last resort method for large/short-warning scenarios
        """
        try:
            # Nuclear yield in joules
            nuclear_yield_joules = nuclear_yield_megatons * 4.184e15
            
            # Calculate momentum transfer (simplified)
            momentum_transfer = np.sqrt(2 * nuclear_yield_joules * asteroid_mass)
            
            # Calculate velocity change
            velocity_change = momentum_transfer / asteroid_mass
            
            # Calculate orbital deflection
            orbital_deflection = self._calculate_orbital_deflection(
                velocity_change, deflection_time, impact_velocity
            )
            
            deflection_distance = orbital_deflection['deflection_distance']
            
            # Mission parameters
            mission_cost = self._estimate_nuclear_cost(nuclear_yield_megatons, deflection_time)
            mission_duration = deflection_time
            
            # Success criteria
            success = deflection_distance > 6371
            
            # Lower confidence due to uncertainty and political factors
            confidence = min(0.7, 0.4 + 0.05 * deflection_time)
            
            return DeflectionResult(
                success=success,
                velocity_change=velocity_change,
                orbital_change=orbital_deflection,
                deflection_distance=deflection_distance,
                confidence_level=confidence,
                mission_cost=mission_cost,
                mission_duration=mission_duration
            )
            
        except Exception as e:
            logger.error(f"Error calculating nuclear deflection: {e}")
            return DeflectionResult(
                success=False,
                velocity_change=0,
                orbital_change={},
                deflection_distance=0,
                confidence_level=0,
                mission_cost=0,
                mission_duration=0
            )
    
    def _calculate_orbital_deflection(self, velocity_change: float,
                                    deflection_time: float,
                                    impact_velocity: float) -> Dict:
        """Calculate orbital deflection from velocity change"""
        # Simplified orbital mechanics calculation
        # Deflection grows approximately linearly with time
        
        # Calculate deflection at Earth encounter
        time_to_impact = deflection_time * 365.25 * 24 * 3600  # seconds
        
        # Orbital deflection (simplified)
        deflection_distance = velocity_change * time_to_impact / 1000  # km
        
        # Orbital parameter changes
        orbital_change = {
            'semi_major_axis_change': velocity_change / impact_velocity * 0.01,  # AU
            'eccentricity_change': velocity_change / impact_velocity * 0.001,
            'inclination_change': velocity_change / impact_velocity * 0.1,  # degrees
            'deflection_distance': deflection_distance
        }
        
        return orbital_change
    
    def _estimate_kinetic_impactor_cost(self, spacecraft_mass: float, 
                                      deflection_time: float) -> float:
        """Estimate kinetic impactor mission cost"""
        # Based on DART mission cost (~$325M) and scaling
        base_cost = 325e6  # USD
        mass_factor = (spacecraft_mass / 500) ** 0.5  # DART was ~500 kg
        time_factor = (10 / deflection_time) ** 0.3  # Penalty for short notice
        
        return base_cost * mass_factor * time_factor
    
    def _estimate_gravity_tractor_cost(self, spacecraft_mass: float,
                                     deflection_time: float) -> float:
        """Estimate gravity tractor mission cost"""
        # More expensive due to long duration and precision requirements
        base_cost = 500e6  # USD
        mass_factor = (spacecraft_mass / 1000) ** 0.6  # Larger spacecraft needed
        time_factor = deflection_time / 5  # Linear scaling with time
        
        return base_cost * mass_factor * time_factor
    
    def _estimate_ion_beam_cost(self, ion_beam_thrust: float,
                              deflection_time: float) -> float:
        """Estimate ion beam mission cost"""
        # High technology cost
        base_cost = 800e6  # USD
        thrust_factor = (ion_beam_thrust / 0.1) ** 0.4  # 0.1 N baseline
        time_factor = deflection_time / 3  # Linear scaling
        
        return base_cost * thrust_factor * time_factor
    
    def _estimate_nuclear_cost(self, nuclear_yield_megatons: float,
                             deflection_time: float) -> float:
        """Estimate nuclear mission cost"""
        # Political and technical complexity
        base_cost = 2000e6  # USD
        yield_factor = (nuclear_yield_megatons / 1) ** 0.3
        time_factor = (1 / deflection_time) ** 0.5  # Higher cost for short notice
        
        return base_cost * yield_factor * time_factor
    
    def get_recommended_mitigation_strategy(self, asteroid_mass: float,
                                          asteroid_diameter: float,
                                          deflection_time: float,
                                          impact_velocity: float) -> Dict:
        """Get recommended mitigation strategy based on asteroid characteristics"""
        
        strategies = {}
        
        # Kinetic impactor (suitable for most scenarios)
        if deflection_time > 2:  # Need at least 2 years
            kinetic_result = self.calculate_kinetic_impactor_deflection(
                asteroid_mass, 1000, 6.6, deflection_time, impact_velocity
            )
            strategies['kinetic_impactor'] = {
                'result': kinetic_result,
                'suitability': 'high' if kinetic_result.success else 'low',
                'recommended_for': ['small_medium_asteroids', 'sufficient_warning']
            }
        
        # Gravity tractor (suitable for small asteroids with long warning)
        if deflection_time > 10 and asteroid_diameter < 0.5:  # Small asteroid, long warning
            gravity_result = self.calculate_gravity_tractor_deflection(
                asteroid_mass, 2000, 100, deflection_time, impact_velocity
            )
            strategies['gravity_tractor'] = {
                'result': gravity_result,
                'suitability': 'high' if gravity_result.success else 'low',
                'recommended_for': ['small_asteroids', 'long_warning', 'precise_deflection']
            }
        
        # Ion beam (suitable for medium asteroids)
        if deflection_time > 5:
            ion_result = self.calculate_ion_beam_deflection(
                asteroid_mass, 0.5, deflection_time, impact_velocity
            )
            strategies['ion_beam'] = {
                'result': ion_result,
                'suitability': 'medium' if ion_result.success else 'low',
                'recommended_for': ['medium_asteroids', 'continuous_control']
            }
        
        # Nuclear (last resort for large/short-warning scenarios)
        if deflection_time < 5 or asteroid_diameter > 1.0:
            nuclear_result = self.calculate_nuclear_deflection(
                asteroid_mass, 1.0, 100, deflection_time, impact_velocity
            )
            strategies['nuclear'] = {
                'result': nuclear_result,
                'suitability': 'last_resort' if nuclear_result.success else 'not_recommended',
                'recommended_for': ['large_asteroids', 'short_warning', 'emergency']
            }
        
        # Find best strategy
        best_strategy = None
        best_score = 0
        
        for name, strategy in strategies.items():
            result = strategy['result']
            if result.success:
                score = result.confidence_level * (1 / result.mission_cost * 1e9)  # Cost efficiency
                if score > best_score:
                    best_score = score
                    best_strategy = name
        
        return {
            'strategies': strategies,
            'recommended_strategy': best_strategy,
            'recommendation_reason': self._get_recommendation_reason(strategies, best_strategy)
        }
    
    def _get_recommendation_reason(self, strategies: Dict, best_strategy: str) -> str:
        """Get explanation for strategy recommendation"""
        if not best_strategy:
            return "No viable mitigation strategies available with current technology and time constraints."
        
        reasons = {
            'kinetic_impactor': "Kinetic impactor is the most proven method (DART mission) with high success probability and reasonable cost.",
            'gravity_tractor': "Gravity tractor provides precise deflection for small asteroids with sufficient warning time.",
            'ion_beam': "Ion beam offers continuous control and high precision for medium-sized asteroids.",
            'nuclear': "Nuclear deflection is the only viable option for large asteroids or short warning scenarios."
        }
        
        return reasons.get(best_strategy, "Strategy selected based on asteroid characteristics and mission constraints.")
