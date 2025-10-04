from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import logging
from api.nasa_integration import NASADataService, USGSSeismicService, ImpactSimulationService, ImpactParameters
from api.mitigation_system import MitigationSystem
from models.asteroid import Asteroid
from models.impact import ImpactSimulation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Initialize services
nasa_service = NASADataService()
usgs_service = USGSSeismicService()
impact_service = ImpactSimulationService(nasa_service, usgs_service)
mitigation_service = MitigationSystem()

@api_bp.route('/health')
@cross_origin()
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'EarthsFirewall API is running',
        'version': '2.0.0'
    })

@api_bp.route('/test')
@cross_origin()
def test_endpoint():
    """Test endpoint for development"""
    return jsonify({
        'message': 'Test endpoint working',
        'timestamp': '2024-01-01T00:00:00Z'
    })

# ===== ASTEROID DATA ENDPOINTS =====

@api_bp.route('/asteroids/neo')
@cross_origin()
def get_near_earth_objects():
    """Get current near-Earth objects from NASA"""
    try:
        limit = request.args.get('limit', 50, type=int)
        asteroids = nasa_service.get_near_earth_objects(limit)
        
        # If no asteroids from API, use fallback
        if not asteroids:
            asteroids = nasa_service._get_fallback_asteroids()
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
            'asteroids': [
                {
                    'designation': a.designation,
                    'name': a.name,
                    'diameter_km': a.diameter,
                    'velocity_km_s': a.velocity,
                    'is_potentially_hazardous': a.is_potentially_hazardous,
                    'absolute_magnitude': a.absolute_magnitude,
                    'albedo': a.albedo,
                    'spectral_type': a.spectral_type,
                    'composition': nasa_service._determine_composition(a.spectral_type, a.absolute_magnitude),
                    'orbital_elements': a.orbital_elements
                } for a in asteroids
            ]
        })
    except Exception as e:
        logger.error(f"Error fetching NEO data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/asteroids/pha')
@cross_origin()
def get_potentially_hazardous_asteroids():
    """Get potentially hazardous asteroids"""
    try:
        asteroids = nasa_service.get_potentially_hazardous_asteroids()
        
        # If no asteroids from API, use fallback
        if not asteroids:
            asteroids = nasa_service._get_fallback_asteroids()
            # Filter to only potentially hazardous ones
            asteroids = [a for a in asteroids if a.is_potentially_hazardous]
        
        return jsonify({
            'success': True,
            'count': len(asteroids),
            'asteroids': [
                {
                    'designation': a.designation,
                    'name': a.name,
                    'diameter_km': a.diameter,
                    'velocity_km_s': a.velocity,
                    'absolute_magnitude': a.absolute_magnitude,
                    'spectral_type': a.spectral_type,
                    'is_potentially_hazardous': a.is_potentially_hazardous,
                    'close_approach_data': a.close_approach_data
                } for a in asteroids
            ]
        })
    except Exception as e:
        logger.error(f"Error fetching PHA data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/asteroids/<designation>')
@cross_origin()
def get_asteroid_details(designation):
    """Get detailed asteroid information by designation"""
    try:
        asteroid = nasa_service.get_asteroid_by_designation(designation)
        
        if not asteroid:
            return jsonify({
                'success': False,
                'error': 'Asteroid not found'
            }), 404
        
        return jsonify({
            'success': True,
            'asteroid': {
                'designation': asteroid.designation,
                'name': asteroid.name,
                'diameter_km': asteroid.diameter,
                'diameter_uncertainty': asteroid.diameter_uncertainty,
                'mass_kg': asteroid.mass,
                'velocity_km_s': asteroid.velocity,
                'is_potentially_hazardous': asteroid.is_potentially_hazardous,
                'absolute_magnitude': asteroid.absolute_magnitude,
                'albedo': asteroid.albedo,
                'spectral_type': asteroid.spectral_type,
                'orbital_elements': asteroid.orbital_elements,
                'close_approach_data': asteroid.close_approach_data
            }
        })
    except Exception as e:
        logger.error(f"Error fetching asteroid details: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/asteroids/close-approaches')
@cross_origin()
def get_close_approaches():
    """Get upcoming close approaches to Earth"""
    try:
        days = request.args.get('days', 30, type=int)
        approaches = nasa_service.get_earth_close_approaches(days)
        
        return jsonify({
            'success': True,
            'count': len(approaches),
            'close_approaches': approaches
        })
    except Exception as e:
        logger.error(f"Error fetching close approaches: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== IMPACT SIMULATION ENDPOINTS =====

@api_bp.route('/simulation/impact', methods=['POST'])
@cross_origin()
def simulate_impact():
    """Simulate asteroid impact scenario"""
    try:
        data = request.get_json()
        
        # Validate required parameters
        required_fields = ['asteroid', 'impact_velocity', 'impact_angle', 'impact_location']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Create asteroid object
        asteroid_data = data['asteroid']
        asteroid = Asteroid(
            designation=asteroid_data.get('designation', 'custom'),
            name=asteroid_data.get('name', 'Custom Asteroid'),
            diameter=asteroid_data.get('diameter_km', 1.0),
            mass=asteroid_data.get('mass_kg', 1e12),
            velocity=asteroid_data.get('velocity_km_s', 30.0),
            orbital_elements=asteroid_data.get('orbital_elements', {}),
            is_potentially_hazardous=asteroid_data.get('is_potentially_hazardous', False)
        )
        
        # Create impact parameters
        impact_params = ImpactParameters(
            asteroid_mass=asteroid.mass,
            asteroid_diameter=asteroid.diameter,
            impact_velocity=data['impact_velocity'],
            impact_angle=data['impact_angle'],
            impact_location=tuple(data['impact_location']),
            target_material=data.get('target_material', 'rock')
        )
        
        # Run simulation
        simulation_result = impact_service.simulate_full_impact(asteroid, impact_params)
        
        return jsonify({
            'success': True,
            'simulation': simulation_result
        })
        
    except Exception as e:
        logger.error(f"Error running impact simulation: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/simulation/custom-asteroid', methods=['POST'])
@cross_origin()
def create_custom_asteroid():
    """Create custom asteroid for simulation"""
    try:
        data = request.get_json()
        
        # Validate required parameters
        required_fields = ['diameter_km', 'density_kg_m3', 'velocity_km_s']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Calculate mass from diameter and density
        diameter = data['diameter_km']
        density = data['density_kg_m3']
        volume = (4/3) * 3.14159 * (diameter * 500) ** 3  # Convert km to m for volume
        mass = volume * density
        
        asteroid = {
            'designation': 'custom',
            'name': data.get('name', 'Custom Asteroid'),
            'diameter_km': diameter,
            'mass_kg': mass,
            'velocity_km_s': data['velocity_km_s'],
            'density_kg_m3': density,
            'composition': data.get('composition', 'unknown'),
            'spectral_type': data.get('spectral_type', 'unknown'),
            'is_potentially_hazardous': data.get('is_potentially_hazardous', True)
        }
        
        return jsonify({
            'success': True,
            'asteroid': asteroid
        })
        
    except Exception as e:
        logger.error(f"Error creating custom asteroid: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== MITIGATION ENDPOINTS =====

@api_bp.route('/mitigation/strategies', methods=['POST'])
@cross_origin()
def get_mitigation_strategies():
    """Get recommended mitigation strategies for an asteroid"""
    try:
        data = request.get_json()
        
        # Validate required parameters
        required_fields = ['asteroid_mass_kg', 'asteroid_diameter_km', 'deflection_time_years']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Get mitigation strategies
        strategies = mitigation_service.get_recommended_mitigation_strategy(
            asteroid_mass=data['asteroid_mass_kg'],
            asteroid_diameter=data['asteroid_diameter_km'],
            deflection_time=data['deflection_time_years'],
            impact_velocity=data.get('impact_velocity_km_s', 30.0)
        )
        
        return jsonify({
            'success': True,
            'strategies': strategies
        })
        
    except Exception as e:
        logger.error(f"Error getting mitigation strategies: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/mitigation/simulate', methods=['POST'])
@cross_origin()
def simulate_mitigation():
    """Simulate specific mitigation strategy"""
    try:
        data = request.get_json()
        
        # Validate required parameters
        required_fields = ['strategy_type', 'asteroid_mass_kg', 'deflection_time_years']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        strategy_type = data['strategy_type']
        asteroid_mass = data['asteroid_mass_kg']
        deflection_time = data['deflection_time_years']
        impact_velocity = data.get('impact_velocity_km_s', 30.0)
        
        result = None
        
        if strategy_type == 'kinetic_impactor':
            result = mitigation_service.calculate_kinetic_impactor_deflection(
                asteroid_mass, data.get('spacecraft_mass_kg', 1000),
                data.get('approach_velocity_km_s', 6.6), deflection_time, impact_velocity
            )
        elif strategy_type == 'gravity_tractor':
            result = mitigation_service.calculate_gravity_tractor_deflection(
                asteroid_mass, data.get('spacecraft_mass_kg', 2000),
                data.get('hover_distance_m', 100), deflection_time, impact_velocity
            )
        elif strategy_type == 'ion_beam':
            result = mitigation_service.calculate_ion_beam_deflection(
                asteroid_mass, data.get('ion_beam_thrust_n', 0.5),
                deflection_time, impact_velocity
            )
        elif strategy_type == 'nuclear':
            result = mitigation_service.calculate_nuclear_deflection(
                asteroid_mass, data.get('nuclear_yield_megatons', 1.0),
                data.get('detonation_distance_m', 100), deflection_time, impact_velocity
            )
        else:
            return jsonify({
                'success': False,
                'error': f'Unknown strategy type: {strategy_type}'
            }), 400
        
        return jsonify({
            'success': True,
            'strategy_type': strategy_type,
            'result': {
                'success': result.success,
                'velocity_change_ms': result.velocity_change,
                'orbital_change': result.orbital_change,
                'deflection_distance_km': result.deflection_distance,
                'confidence_level': result.confidence_level,
                'mission_cost_usd': result.mission_cost,
                'mission_duration_years': result.mission_duration
            }
        })
        
    except Exception as e:
        logger.error(f"Error simulating mitigation: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# ===== SEISMIC DATA ENDPOINTS =====

@api_bp.route('/seismic/earthquakes')
@cross_origin()
def get_historical_earthquakes():
    """Get historical earthquakes for comparison"""
    try:
        magnitude_min = request.args.get('magnitude_min', 5.0, type=float)
        magnitude_max = request.args.get('magnitude_max', 9.0, type=float)
        
        earthquakes = usgs_service.get_historical_earthquakes(magnitude_min, magnitude_max)
        
        return jsonify({
            'success': True,
            'count': len(earthquakes),
            'earthquakes': earthquakes
        })
        
    except Exception as e:
        logger.error(f"Error fetching earthquake data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/seismic/energy-to-magnitude', methods=['POST'])
@cross_origin()
def convert_energy_to_magnitude():
    """Convert impact energy to equivalent earthquake magnitude"""
    try:
        data = request.get_json()
        
        if 'energy_joules' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing energy_joules parameter'
            }), 400
        
        magnitude = usgs_service.get_equivalent_magnitude(data['energy_joules'])
        
        return jsonify({
            'success': True,
            'energy_joules': data['energy_joules'],
            'equivalent_magnitude': magnitude,
            'tnt_equivalent_megatons': data['energy_joules'] / (4.184e15)
        })
        
    except Exception as e:
        logger.error(f"Error converting energy to magnitude: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500