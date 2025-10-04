# Physical constants for Asteroid Impact Simulator
# Physical constants
# GRAVITATIONAL_CONSTANT = 6.674e-11  # m^3 kg^-1 s^-2
# EARTH_RADIUS = 6371  # km
# EARTH_MASS = 5.972e24  # kg
# ASTEROID_DENSITY = 3000  # kg/m^3 (default)
# SPEED_OF_LIGHT = 299792.458  # km/s
# 
# Unit conversions
# KM_TO_M = 1000
# JOULES_TO_MEGATONS = 1 / 4.184e15
# 
# API endpoints
# NASA_NEO_API_BASE = "https://api.nasa.gov/neo/rest/v1"

# Physical Constants
GRAVITATIONAL_CONSTANT = 6.674e-11  # m^3 kg^-1 s^-2
EARTH_RADIUS = 6371  # km
EARTH_MASS = 5.972e24  # kg
SUN_MASS = 1.989e30  # kg
ASTEROID_DENSITY = 3000  # kg/m^3 (default)
SPEED_OF_LIGHT = 299792.458  # km/s

# Astronomical Units
AU_TO_KM = 1.496e8  # km
AU_TO_M = 1.496e11  # m

# Unit Conversions
KM_TO_M = 1000
M_TO_KM = 0.001
JOULES_TO_MEGATONS = 1 / 4.184e15
MEGATONS_TO_JOULES = 4.184e15

# Impact Physics Constants
CRATER_SCALING_FACTOR = 0.1  # km per (J)^(1/3)
BLAST_SCALING_FACTOR = 1.2  # km per (MT)^(1/3)
THERMAL_SCALING_FACTOR = 3.0  # km per (MT)^(1/3)

# Mitigation Constants
KINETIC_IMPACTOR_VELOCITY = 12.0  # km/s
GRAVITY_TRACTOR_DISTANCE = 100  # meters
DEFLECTION_EFFICIENCY = 0.5  # Fraction of momentum transferred

# Environmental Constants
TSUNAMI_SPEED_DEEP_OCEAN = 200  # m/s
SEISMIC_ENERGY_FACTOR = 1.5  # Energy to magnitude conversion
ATMOSPHERIC_DUST_FACTOR = 1000  # tons per megaton TNT

# API Endpoints
NASA_NEO_API_BASE = "https://api.nasa.gov/neo/rest/v1"
USGS_EARTHQUAKE_API = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
USGS_ELEVATION_API = "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer"

# Simulation Constants
DEFAULT_TIME_STEPS = 100
DEFAULT_SIMULATION_DURATION = 365  # days
MIN_CRATER_SIZE = 0.001  # km
MAX_CRATER_SIZE = 1000  # km

# Game Mode Constants
GAME_LEVELS = {
    1: {'asteroid_size': 10, 'time_limit': 300, 'difficulty': 'Easy'},
    2: {'asteroid_size': 50, 'time_limit': 240, 'difficulty': 'Medium'},
    3: {'asteroid_size': 100, 'time_limit': 180, 'difficulty': 'Hard'},
    4: {'asteroid_size': 500, 'time_limit': 120, 'difficulty': 'Expert'},
    5: {'asteroid_size': 1000, 'time_limit': 60, 'difficulty': 'Nightmare'}
}

# Scoring Constants
BASE_SCORE = 1000
TIME_BONUS_MULTIPLIER = 10
EFFICIENCY_BONUS_MULTIPLIER = 5
SURVIVAL_BONUS = 5000
