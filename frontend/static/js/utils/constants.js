// Frontend constants for Asteroid Impact Simulator
// 
// const EARTH_RADIUS = 6371; // km
// const AU_TO_KM = 149597870.7; // 1 AU in km
// const GRAVITATIONAL_CONSTANT = 6.674e-11; // m^3 kg^-1 s^-2
// const ASTEROID_DENSITY = 3000; // kg/m^3

// Physical Constants
const EARTH_RADIUS = 6371; // km
const AU_TO_KM = 149597870.7; // 1 AU in km
const GRAVITATIONAL_CONSTANT = 6.674e-11; // m^3 kg^-1 s^-2
const ASTEROID_DENSITY = 3000; // kg/m^3
const SUN_MASS = 1.989e30; // kg
const EARTH_MASS = 5.972e24; // kg

// Unit Conversions
const KM_TO_M = 1000;
const M_TO_KM = 0.001;
const JOULES_TO_MEGATONS = 1 / 4.184e15;
const MEGATONS_TO_JOULES = 4.184e15;

// API Configuration
const API_BASE_URL = '/api';
const NASA_API_KEY = 'uBrhRPrA8pXYDoMc0TOzdyFRkMmcyvGA1ZmMVqKM';

// Simulation Constants
const DEFAULT_TIME_STEPS = 100;
const DEFAULT_SIMULATION_DURATION = 365; // days
const MIN_CRATER_SIZE = 0.001; // km
const MAX_CRATER_SIZE = 1000; // km

// Impact Physics Constants
const CRATER_SCALING_FACTOR = 0.1; // km per (J)^(1/3)
const BLAST_SCALING_FACTOR = 1.2; // km per (MT)^(1/3)
const THERMAL_SCALING_FACTOR = 3.0; // km per (MT)^(1/3)

// Mitigation Constants
const KINETIC_IMPACTOR_VELOCITY = 12.0; // km/s
const GRAVITY_TRACTOR_DISTANCE = 100; // meters
const DEFLECTION_EFFICIENCY = 0.5; // Fraction of momentum transferred

// Environmental Constants
const TSUNAMI_SPEED_DEEP_OCEAN = 200; // m/s
const SEISMIC_ENERGY_FACTOR = 1.5; // Energy to magnitude conversion
const ATMOSPHERIC_DUST_FACTOR = 1000; // tons per megaton TNT

// Game Mode Constants
const GAME_LEVELS = {
    1: { asteroid_size: 10, time_limit: 300, difficulty: 'Easy' },
    2: { asteroid_size: 50, time_limit: 240, difficulty: 'Medium' },
    3: { asteroid_size: 100, time_limit: 180, difficulty: 'Hard' },
    4: { asteroid_size: 500, time_limit: 120, difficulty: 'Expert' },
    5: { asteroid_size: 1000, time_limit: 60, difficulty: 'Nightmare' }
};

// Scoring Constants
const BASE_SCORE = 1000;
const TIME_BONUS_MULTIPLIER = 10;
const EFFICIENCY_BONUS_MULTIPLIER = 5;
const SURVIVAL_BONUS = 5000;

// Visual Constants
const EARTH_SCALE = 1;
const ASTEROID_SCALE = 0.1;
const ORBIT_SCALE = 0.01;
const IMPACT_ZONE_COLORS = {
    blast: '#ff4444',
    thermal: '#ffaa00',
    seismic: '#ff6600',
    tsunami: '#0066ff'
};

// Animation Constants
const EARTH_ROTATION_SPEED = 0.001;
const ASTEROID_ORBIT_SPEED = 0.01;
const IMPACT_ANIMATION_DURATION = 2000; // ms
const DEFLECTION_ANIMATION_DURATION = 1000; // ms

// UI Constants
const NOTIFICATION_DURATION = 3000; // ms
const TOOLTIP_DELAY = 500; // ms
const SLIDER_UPDATE_DELAY = 100; // ms

// Performance Constants
const MAX_ASTEROIDS_DISPLAYED = 50;
const MAX_ORBIT_POINTS = 1000;
const TARGET_FPS = 60;
const LOW_FPS_THRESHOLD = 30;
const CRITICAL_FPS_THRESHOLD = 15;

// Error Messages
const ERROR_MESSAGES = {
    API_FAILED: 'Failed to connect to NASA API',
    SIMULATION_FAILED: 'Simulation failed to start',
    INVALID_ASTEROID: 'Invalid asteroid data',
    NETWORK_ERROR: 'Network connection error',
    RENDER_ERROR: '3D rendering error'
};

// Success Messages
const SUCCESS_MESSAGES = {
    SIMULATION_STARTED: 'Simulation started successfully',
    DEFLECTION_SUCCESS: 'Deflection strategy successful',
    GAME_LEVEL_COMPLETE: 'Level completed!',
    DATA_LOADED: 'Asteroid data loaded'
};

// Warning Messages
const WARNING_MESSAGES = {
    LOW_PERFORMANCE: 'Performance may be affected',
    LARGE_ASTEROID: 'Large asteroid detected',
    HIGH_IMPACT_RISK: 'High impact risk detected',
    SIMULATION_PAUSED: 'Simulation paused'
};

// Info Messages
const INFO_MESSAGES = {
    LOADING_DATA: 'Loading asteroid data...',
    CALCULATING_IMPACT: 'Calculating impact scenario...',
    SIMULATING_DEFLECTION: 'Simulating deflection...',
    RENDERING_SCENE: 'Rendering 3D scene...'
};

// Export constants for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EARTH_RADIUS,
        AU_TO_KM,
        GRAVITATIONAL_CONSTANT,
        ASTEROID_DENSITY,
        SUN_MASS,
        EARTH_MASS,
        KM_TO_M,
        M_TO_KM,
        JOULES_TO_MEGATONS,
        MEGATONS_TO_JOULES,
        API_BASE_URL,
        NASA_API_KEY,
        DEFAULT_TIME_STEPS,
        DEFAULT_SIMULATION_DURATION,
        MIN_CRATER_SIZE,
        MAX_CRATER_SIZE,
        CRATER_SCALING_FACTOR,
        BLAST_SCALING_FACTOR,
        THERMAL_SCALING_FACTOR,
        KINETIC_IMPACTOR_VELOCITY,
        GRAVITY_TRACTOR_DISTANCE,
        DEFLECTION_EFFICIENCY,
        TSUNAMI_SPEED_DEEP_OCEAN,
        SEISMIC_ENERGY_FACTOR,
        ATMOSPHERIC_DUST_FACTOR,
        GAME_LEVELS,
        BASE_SCORE,
        TIME_BONUS_MULTIPLIER,
        EFFICIENCY_BONUS_MULTIPLIER,
        SURVIVAL_BONUS,
        EARTH_SCALE,
        ASTEROID_SCALE,
        ORBIT_SCALE,
        IMPACT_ZONE_COLORS,
        EARTH_ROTATION_SPEED,
        ASTEROID_ORBIT_SPEED,
        IMPACT_ANIMATION_DURATION,
        DEFLECTION_ANIMATION_DURATION,
        NOTIFICATION_DURATION,
        TOOLTIP_DELAY,
        SLIDER_UPDATE_DELAY,
        MAX_ASTEROIDS_DISPLAYED,
        MAX_ORBIT_POINTS,
        TARGET_FPS,
        LOW_FPS_THRESHOLD,
        CRITICAL_FPS_THRESHOLD,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        WARNING_MESSAGES,
        INFO_MESSAGES
    };
}
