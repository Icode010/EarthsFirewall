# Simulation API Routes for Asteroid Defense Game
from flask import Blueprint, request, jsonify
from ..simulation.game_engine import game_engine, GameState, DefenseStrategy
from ..calculations.impact_physics import (
    calculate_kinetic_energy, energy_to_tnt_equivalent,
    calculate_crater_diameter, estimate_devastation_radius
)
from ..calculations.mitigation import (
    calculate_kinetic_impactor_deflection,
    calculate_gravity_tractor_deflection,
    calculate_laser_ablation_deflection
)
import time

# Create blueprint for simulation routes
simulation_bp = Blueprint('simulation', __name__, url_prefix='/api/simulation')

@simulation_bp.route('/start-game', methods=['POST'])
def start_game():
    """Start a new game at specified level"""
    try:
        data = request.get_json()
        level = data.get('level', 1)
        
        result = game_engine.start_game(level)
        return jsonify({
            'success': True,
            'game_data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@simulation_bp.route('/game-status', methods=['GET'])
def get_game_status():
    """Get current game status"""
    try:
        status = game_engine.get_game_status()
        return jsonify({
            'success': True,
            'status': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/update', methods=['POST'])
def update_game():
    """Update game state with elapsed time"""
    try:
        data = request.get_json()
        delta_time = data.get('delta_time', 0.016)  # Default 60 FPS
        
        result = game_engine.update_game_state(delta_time)
        return jsonify({
            'success': True,
            'update': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/simulate-impact', methods=['POST'])
def simulate_impact():
    """Simulate asteroid impact and calculate effects"""
    try:
        data = request.get_json()
        impact_angle = data.get('impact_angle', 45.0)
        
        if not game_engine.asteroid:
            return jsonify({
                'success': False,
                'error': 'No asteroid loaded'
            }), 400
        
        # Calculate impact physics
        energy = calculate_kinetic_energy(game_engine.asteroid.mass, game_engine.asteroid.velocity)
        tnt_equivalent = energy_to_tnt_equivalent(energy)
        crater_diameter = calculate_crater_diameter(energy, impact_angle)
        devastation = estimate_devastation_radius(crater_diameter, tnt_equivalent)
        
        # Calculate environmental effects
        environmental_effects = {
            'tsunami_risk': 'High' if tnt_equivalent > 1 else 'Low',
            'seismic_magnitude': 6.0 + (tnt_equivalent ** 0.3),
            'atmospheric_dust': tnt_equivalent * 1000,  # tons
            'climate_impact': 'Severe' if tnt_equivalent > 10 else 'Moderate'
        }
        
        return jsonify({
            'success': True,
            'impact_data': {
                'energy_joules': energy,
                'tnt_equivalent': tnt_equivalent,
                'crater_diameter': crater_diameter,
                'devastation_radius': devastation,
                'environmental_effects': environmental_effects,
                'asteroid_data': {
                    'name': game_engine.asteroid.name,
                    'diameter': game_engine.asteroid.diameter,
                    'velocity': game_engine.asteroid.velocity,
                    'mass': game_engine.asteroid.mass
                }
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/attempt-deflection', methods=['POST'])
def attempt_deflection():
    """Attempt to deflect asteroid using specified strategy"""
    try:
        data = request.get_json()
        strategy_name = data.get('strategy', 'kinetic')
        deflection_force = data.get('deflection_force', 1.0)
        
        # Convert string to enum
        strategy_map = {
            'kinetic': DefenseStrategy.KINETIC_IMPACTOR,
            'gravity': DefenseStrategy.GRAVITY_TRACTOR,
            'laser': DefenseStrategy.LASER_ABLATION
        }
        
        strategy = strategy_map.get(strategy_name)
        if not strategy:
            return jsonify({
                'success': False,
                'error': f'Invalid strategy: {strategy_name}'
            }), 400
        
        # Calculate deflection based on strategy
        if strategy == DefenseStrategy.KINETIC_IMPACTOR:
            deflection_percentage = calculate_kinetic_impactor_deflection(
                game_engine.asteroid.mass, deflection_force
            )
        elif strategy == DefenseStrategy.GRAVITY_TRACTOR:
            deflection_percentage = calculate_gravity_tractor_deflection(
                game_engine.asteroid.mass, deflection_force
            )
        elif strategy == DefenseStrategy.LASER_ABLATION:
            deflection_percentage = calculate_laser_ablation_deflection(
                game_engine.asteroid.mass, deflection_force
            )
        
        # Calculate results
        success = deflection_percentage > 0.1  # 10% minimum deflection
        new_miss_distance = deflection_percentage * 1000  # Simplified calculation
        time_to_impact = 30.0  # Simplified calculation
        
        # Update score if successful
        if success:
            score_bonus = int(deflection_percentage * 1000)
            game_engine.score += score_bonus
        
        return jsonify({
            'success': True,
            'deflection_result': {
                'deflection_success': success,
                'deflection_percentage': deflection_percentage,
                'new_miss_distance': new_miss_distance,
                'time_to_impact': time_to_impact,
                'strategy_used': strategy_name,
                'score_bonus': score_bonus if success else 0
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/pause', methods=['POST'])
def pause_game():
    """Pause the game"""
    try:
        game_engine.pause_game()
        return jsonify({
            'success': True,
            'message': 'Game paused'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/resume', methods=['POST'])
def resume_game():
    """Resume the game"""
    try:
        game_engine.resume_game()
        return jsonify({
            'success': True,
            'message': 'Game resumed'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/reset', methods=['POST'])
def reset_game():
    """Reset game to initial state"""
    try:
        game_engine.reset_game()
        return jsonify({
            'success': True,
            'message': 'Game reset'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/asteroid-data', methods=['GET'])
def get_asteroid_data():
    """Get current asteroid data"""
    try:
        if not game_engine.asteroid:
            return jsonify({
                'success': False,
                'error': 'No asteroid loaded'
            }), 400
        
        asteroid_data = {
            'name': game_engine.asteroid.name,
            'diameter': game_engine.asteroid.diameter,
            'velocity': game_engine.asteroid.velocity,
            'mass': game_engine.asteroid.mass,
            'density': game_engine.asteroid.density,
            'position': game_engine.asteroid.position,
            'orbital_elements': game_engine.asteroid.orbital_elements
        }
        
        return jsonify({
            'success': True,
            'asteroid': asteroid_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/physics-calculations', methods=['POST'])
def physics_calculations():
    """Perform detailed physics calculations"""
    try:
        data = request.get_json()
        diameter = data.get('diameter', 0.5)  # km
        velocity = data.get('velocity', 15.2)  # km/s
        density = data.get('density', 3000)  # kg/m³
        impact_angle = data.get('impact_angle', 45.0)  # degrees
        
        # Calculate mass
        from ..calculations.impact_physics import calculate_mass_from_diameter
        mass = calculate_mass_from_diameter(diameter, density)
        
        # Calculate impact physics
        energy = calculate_kinetic_energy(mass, velocity)
        tnt_equivalent = energy_to_tnt_equivalent(energy)
        crater_diameter = calculate_crater_diameter(energy, impact_angle)
        devastation = estimate_devastation_radius(crater_diameter, tnt_equivalent)
        
        return jsonify({
            'success': True,
            'physics_data': {
                'mass': mass,
                'energy_joules': energy,
                'tnt_equivalent': tnt_equivalent,
                'crater_diameter': crater_diameter,
                'devastation_radius': devastation,
                'input_parameters': {
                    'diameter': diameter,
                    'velocity': velocity,
                    'density': density,
                    'impact_angle': impact_angle
                }
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@simulation_bp.route('/deflection-strategies', methods=['GET'])
def get_deflection_strategies():
    """Get available deflection strategies and their properties"""
    try:
        strategies = {
            'kinetic_impactor': {
                'name': 'Kinetic Impactor',
                'description': 'High-speed impact to change asteroid trajectory',
                'effectiveness': 'High for small-medium asteroids',
                'time_required': 'Months to years',
                'cost': 'Medium',
                'risk': 'Low'
            },
            'gravity_tractor': {
                'name': 'Gravity Tractor',
                'description': 'Use gravitational force to gradually deflect asteroid',
                'effectiveness': 'High for large asteroids',
                'time_required': 'Years',
                'cost': 'High',
                'risk': 'Low'
            },
            'laser_ablation': {
                'name': 'Laser Ablation',
                'description': 'Use focused laser to vaporize surface material',
                'effectiveness': 'High for small asteroids',
                'time_required': 'Months to years',
                'cost': 'Very High',
                'risk': 'Medium'
            }
        }
        
        return jsonify({
            'success': True,
            'strategies': strategies
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
