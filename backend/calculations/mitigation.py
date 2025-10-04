# Mitigation strategy calculations for Asteroid Impact Simulator
import numpy as np
import math
from ..calculations.orbital_mechanics import apply_velocity_change, calculate_earth_intersection
from ..utils.constants import GRAVITATIONAL_CONSTANT, KINETIC_IMPACTOR_VELOCITY, GRAVITY_TRACTOR_DISTANCE, DEFLECTION_EFFICIENCY

def calculate_kinetic_impactor_deflection(asteroid_mass, deflection_force):
    """
    Calculate deflection percentage for kinetic impactor strategy
    
    Args:
        asteroid_mass (float): Asteroid mass in kg
        deflection_force (float): Deflection force multiplier (0-1)
    
    Returns:
        float: Deflection percentage (0-1)
    """
    # Simplified kinetic impactor calculation
    # Based on momentum transfer and asteroid mass
    base_deflection = 0.3  # 30% base deflection
    mass_factor = min(1.0, 1e12 / asteroid_mass)  # Smaller asteroids easier to deflect
    force_factor = deflection_force
    
    deflection_percentage = base_deflection * mass_factor * force_factor * DEFLECTION_EFFICIENCY
    return min(1.0, deflection_percentage)

def calculate_gravity_tractor_deflection(asteroid_mass, deflection_force):
    """
    Calculate deflection percentage for gravity tractor strategy
    
    Args:
        asteroid_mass (float): Asteroid mass in kg
        deflection_force (float): Deflection force multiplier (0-1)
    
    Returns:
        float: Deflection percentage (0-1)
    """
    # Gravity tractor is more effective for larger asteroids
    # but requires more time
    base_deflection = 0.2  # 20% base deflection
    mass_factor = min(1.0, asteroid_mass / 1e12)  # Larger asteroids easier to deflect
    force_factor = deflection_force
    
    deflection_percentage = base_deflection * mass_factor * force_factor * DEFLECTION_EFFICIENCY
    return min(1.0, deflection_percentage)

def calculate_laser_ablation_deflection(asteroid_mass, deflection_force):
    """
    Calculate deflection percentage for laser ablation strategy
    
    Args:
        asteroid_mass (float): Asteroid mass in kg
        deflection_force (float): Deflection force multiplier (0-1)
    
    Returns:
        float: Deflection percentage (0-1)
    """
    # Laser ablation is most effective for smaller asteroids
    # and requires high power
    base_deflection = 0.4  # 40% base deflection
    mass_factor = min(1.0, 1e10 / asteroid_mass)  # Much smaller asteroids easier
    force_factor = deflection_force ** 2  # Quadratic relationship with power
    
    deflection_percentage = base_deflection * mass_factor * force_factor * DEFLECTION_EFFICIENCY
    return min(1.0, deflection_percentage)

def simulate_kinetic_impactor(asteroid, deflection_time, impactor_mass):
    """
    Simulate kinetic impactor deflection strategy
    
    Args:
        asteroid: Asteroid object
        deflection_time (float): Time until impact in days
        impactor_mass (float): Impactor mass in kg
    
    Returns:
        dict: Deflection results
    """
    # Calculate impactor velocity
    impactor_velocity = KINETIC_IMPACTOR_VELOCITY  # km/s
    
    # Calculate momentum transfer
    momentum_transfer = impactor_mass * impactor_velocity * 1000  # kg⋅m/s
    
    # Calculate delta-v imparted to asteroid
    delta_v = momentum_transfer / asteroid.mass  # m/s
    delta_v_km_s = delta_v / 1000  # km/s
    
    # Calculate deflection angle
    deflection_angle = calculate_deflection_angle(delta_v_km_s, asteroid.velocity)
    
    # Calculate new trajectory
    new_orbital_elements = apply_velocity_change(asteroid, (delta_v_km_s, 0, 0))
    
    # Calculate miss distance
    miss_distance = calculate_miss_distance(asteroid, new_orbital_elements, deflection_time)
    
    # Mission requirements
    mission_requirements = {
        'impactor_mass': impactor_mass,
        'impactor_velocity': impactor_velocity,
        'launch_window': deflection_time - 30,  # days before impact
        'mission_duration': deflection_time,
        'delta_v_required': delta_v_km_s
    }
    
    return {
        'success': miss_distance > 0,
        'miss_distance': miss_distance,
        'deflection_angle': deflection_angle,
        'new_trajectory': new_orbital_elements,
        'mission_requirements': mission_requirements
    }

def simulate_gravity_tractor(asteroid, tractor_mass, duration):
    """
    Simulate gravity tractor deflection strategy
    
    Args:
        asteroid: Asteroid object
        tractor_mass (float): Tractor spacecraft mass in kg
        duration (float): Tractor operation duration in days
    
    Returns:
        dict: Deflection results
    """
    # Calculate gravitational force between tractor and asteroid
    distance = GRAVITY_TRACTOR_DISTANCE  # meters
    
    gravitational_force = GRAVITATIONAL_CONSTANT * asteroid.mass * tractor_mass / (distance ** 2)
    
    # Calculate acceleration on asteroid
    acceleration = gravitational_force / asteroid.mass  # m/s²
    
    # Calculate total velocity change over duration
    duration_seconds = duration * 24 * 3600  # Convert days to seconds
    total_delta_v = acceleration * duration_seconds  # m/s
    total_delta_v_km_s = total_delta_v / 1000  # km/s
    
    # Calculate new trajectory
    new_orbital_elements = apply_velocity_change(asteroid, (total_delta_v_km_s, 0, 0))
    
    # Calculate miss distance
    miss_distance = calculate_miss_distance(asteroid, new_orbital_elements, duration)
    
    # Mission requirements
    mission_requirements = {
        'tractor_mass': tractor_mass,
        'operation_duration': duration,
        'distance': distance,
        'thrust_required': gravitational_force,
        'delta_v_achieved': total_delta_v_km_s
    }
    
    return {
        'success': miss_distance > 0,
        'miss_distance': miss_distance,
        'new_trajectory': new_orbital_elements,
        'mission_requirements': mission_requirements
    }

def calculate_deflection_angle(delta_v, asteroid_velocity):
    """
    Calculate deflection angle from velocity change
    """
    if asteroid_velocity == 0:
        return 0
    
    # Simplified deflection angle calculation
    deflection_angle = math.degrees(math.atan(delta_v / asteroid_velocity))
    return deflection_angle

def calculate_miss_distance(asteroid, new_orbital_elements, time_until_impact):
    """
    Calculate miss distance after deflection
    """
    # Simplified miss distance calculation
    # In reality, would need full orbital propagation
    
    # Calculate trajectory with new elements
    time_steps = np.linspace(0, time_until_impact, 100)
    trajectory = []
    
    for t in time_steps:
        position = calculate_orbital_position(new_orbital_elements, t)
        trajectory.append(position)
    
    # Check for Earth intersection
    intersection = calculate_earth_intersection(trajectory)
    
    if intersection:
        return 0  # Still impacts Earth
    else:
        # Calculate minimum distance to Earth
        min_distance = calculate_minimum_distance_to_earth(trajectory)
        return min_distance

def calculate_orbital_position(orbital_elements, time):
    """
    Calculate orbital position (simplified)
    """
    # This would use the full orbital mechanics calculation
    # For now, return a simplified position
    a = orbital_elements.get('semi_major_axis', 1.0)
    e = orbital_elements.get('eccentricity', 0.0)
    
    # Simplified position calculation
    x = a * math.cos(time * 0.1) * 1.496e8  # km
    y = a * math.sin(time * 0.1) * 1.496e8  # km
    z = 0
    
    return (x, y, z)

def calculate_minimum_distance_to_earth(trajectory):
    """
    Calculate minimum distance to Earth in trajectory
    """
    earth_radius = 6371  # km
    min_distance = float('inf')
    
    for position in trajectory:
        distance = math.sqrt(position[0]**2 + position[1]**2 + position[2]**2)
        min_distance = min(min_distance, distance)
    
    return max(0, min_distance - earth_radius)

def calculate_deflection_requirements(asteroid, current_trajectory, desired_miss_distance):
    """
    Calculate deflection requirements to achieve desired miss distance
    
    Args:
        asteroid: Asteroid object
        current_trajectory (list): Current trajectory points
        desired_miss_distance (float): Desired miss distance in km
    
    Returns:
        dict: Deflection requirements
    """
    # Calculate required delta-v for desired miss distance
    required_delta_v = calculate_required_delta_v(desired_miss_distance, asteroid.velocity)
    
    # Calculate mission requirements
    kinetic_impactor_mass = calculate_impactor_mass(required_delta_v, asteroid.mass)
    gravity_tractor_mass = calculate_tractor_mass(required_delta_v, asteroid.mass)
    
    return {
        'required_delta_v': required_delta_v,
        'kinetic_impactor': {
            'mass': kinetic_impactor_mass,
            'velocity': KINETIC_IMPACTOR_VELOCITY,
            'launch_mass': kinetic_impactor_mass * 2  # Including fuel
        },
        'gravity_tractor': {
            'mass': gravity_tractor_mass,
            'duration': 365,  # days
            'thrust': gravity_tractor_mass * 9.81  # N
        }
    }

def calculate_required_delta_v(desired_miss_distance, asteroid_velocity):
    """
    Calculate required delta-v for desired miss distance
    """
    # Simplified calculation
    # In reality, this would require complex orbital mechanics
    delta_v_factor = desired_miss_distance / 1000  # km
    required_delta_v = delta_v_factor * 0.1  # km/s
    return required_delta_v

def calculate_impactor_mass(required_delta_v, asteroid_mass):
    """
    Calculate required impactor mass
    """
    impactor_velocity = KINETIC_IMPACTOR_VELOCITY  # km/s
    momentum_required = required_delta_v * asteroid_mass  # kg⋅km/s
    impactor_mass = momentum_required / impactor_velocity  # kg
    return impactor_mass

def calculate_tractor_mass(required_delta_v, asteroid_mass):
    """
    Calculate required tractor mass
    """
    # Simplified gravity tractor calculation
    distance = GRAVITY_TRACTOR_DISTANCE  # meters
    duration = 365 * 24 * 3600  # seconds
    
    # Calculate required acceleration
    required_acceleration = required_delta_v * 1000 / duration  # m/s²
    
    # Calculate required mass
    tractor_mass = required_acceleration * asteroid_mass * (distance ** 2) / GRAVITATIONAL_CONSTANT
    return tractor_mass

def evaluate_mitigation_success(original_impact, modified_trajectory):
    """
    Evaluate success of mitigation strategy
    
    Args:
        original_impact (dict): Original impact scenario
        modified_trajectory (list): Modified trajectory after deflection
    
    Returns:
        dict: Success evaluation
    """
    # Check if Earth impact avoided
    intersection = calculate_earth_intersection(modified_trajectory)
    
    if intersection:
        # Still impacts Earth
        return {
            'success': False,
            'miss_distance': 0,
            'impact_avoided': False,
            'remaining_risk': 'High'
        }
    else:
        # Calculate new miss distance
        miss_distance = calculate_minimum_distance_to_earth(modified_trajectory)
        
        # Determine success level
        if miss_distance > 10000:  # > 10,000 km
            success_level = 'Complete'
        elif miss_distance > 1000:  # > 1,000 km
            success_level = 'High'
        elif miss_distance > 100:  # > 100 km
            success_level = 'Moderate'
        else:
            success_level = 'Low'
        
        return {
            'success': True,
            'miss_distance': miss_distance,
            'impact_avoided': True,
            'success_level': success_level,
            'remaining_risk': 'Low' if miss_distance > 1000 else 'Moderate'
        }