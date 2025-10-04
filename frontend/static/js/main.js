// 🌍 Earth's Firewall - Main Application Controller
console.log('🚀 Earth\'s Firewall - Asteroid Impact Simulator Loading...');

// Global Application State
const AppState = {
    isInitialized: false,
    isSimulating: false,
    isGameMode: false,
    currentAsteroid: null,
    simulationData: null,
    threeScene: null,
    camera: null,
    renderer: null,
    earth: null,
    asteroid: null
};

// DOM Elements
const elements = {
    // Controls
    asteroidSelect: document.getElementById('asteroid-select'),
    sizeSlider: document.getElementById('size-slider'),
    velocitySlider: document.getElementById('velocity-slider'),
    angleSlider: document.getElementById('angle-slider'),
    sizeValue: document.getElementById('size-value'),
    velocityValue: document.getElementById('velocity-value'),
    angleValue: document.getElementById('angle-value'),
    
    // Buttons
    simulateBtn: document.getElementById('simulate-btn'),
    deflectBtn: document.getElementById('deflect-btn'),
    gameBtn: document.getElementById('game-btn'),
    resetBtn: document.getElementById('reset-btn'),
    
    // Strategy
    strategyRadios: document.querySelectorAll('input[name="strategy"]'),
    
    // Display
    impactStats: document.getElementById('impact-stats'),
    energyValue: document.getElementById('energy-value'),
    tntValue: document.getElementById('tnt-value'),
    craterValue: document.getElementById('crater-value'),
    
    // Info Panel
    asteroidName: document.getElementById('asteroid-name'),
    asteroidDiameter: document.getElementById('asteroid-diameter'),
    asteroidVelocity: document.getElementById('asteroid-velocity'),
    asteroidMass: document.getElementById('asteroid-mass'),
    
    // Impact Zones
    zoneTotal: document.getElementById('zone-total'),
    zoneSevere: document.getElementById('zone-severe'),
    zoneModerate: document.getElementById('zone-moderate'),
    
    // Effects
    tsunamiRisk: document.getElementById('tsunami-risk'),
    seismicMagnitude: document.getElementById('seismic-magnitude'),
    atmosphericEffect: document.getElementById('atmospheric-effect'),
    
    // Game Mode
    gameOverlay: document.getElementById('game-overlay'),
    gameScore: document.getElementById('game-score'),
    gameLevel: document.getElementById('game-level'),
    gameTime: document.getElementById('game-time'),
    startGameBtn: document.getElementById('start-game'),
    exitGameBtn: document.getElementById('exit-game'),
    
    // Loading
    loadingScreen: document.getElementById('loading-screen')
};

// Initialize Application
async function initializeApp() {
    console.log('🌍 Initializing Earth\'s Firewall...');
    
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize 3D scene
        await initializeThreeJS();
        
        // Initialize controls
        initializeControls();
        
        // Initialize API client
        initializeAPI();
        
        // Load default asteroid data
        await loadDefaultAsteroid();
        
        // Hide loading screen
        hideLoadingScreen();
        
        AppState.isInitialized = true;
        console.log('✅ Earth\'s Firewall initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize:', error);
        showError('Failed to initialize application. Please refresh the page.');
    }
}

// Initialize Three.js Scene
async function initializeThreeJS() {
    console.log('🎨 Initializing amazing 3D scene...');
    
    try {
        // Initialize the amazing 3D scene
        await window.initializeAmazingScene();
        console.log('✅ Amazing 3D scene initialized!');
    } catch (error) {
        console.error('❌ Failed to initialize 3D scene:', error);
        // Fallback to placeholder
        const canvas = document.getElementById('three-canvas');
        if (canvas) {
            canvas.style.background = 'radial-gradient(circle, #1a1a2e 0%, #0a0a0f 100%)';
            canvas.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #00d4ff; font-size: 1.5rem;">🌍 3D Earth Loading...</div>';
        }
    }
}

// Initialize Controls
function initializeControls() {
    console.log('🎛️ Initializing amazing controls...');
    
    try {
        // Initialize controls manager
        if (window.controlsManager) {
            window.controlsManager.initialize();
        }
        
        // Initialize game mode manager
        if (window.gameModeManager) {
            // Game mode is ready
        }
        
        // Initialize tooltips
        if (window.tooltipManager) {
            window.tooltipManager.initialize();
        }
        
        console.log('✅ Amazing controls initialized!');
        
    } catch (error) {
        console.error('❌ Failed to initialize controls:', error);
    }
}

// Update slider values
function updateSizeValue() {
    const value = elements.sizeSlider.value;
    elements.sizeValue.textContent = `${value} km`;
    updateAsteroidInfo();
}

function updateVelocityValue() {
    const value = elements.velocitySlider.value;
    elements.velocityValue.textContent = `${value} km/s`;
    updateAsteroidInfo();
}

function updateAngleValue() {
    const value = elements.angleSlider.value;
    elements.angleValue.textContent = `${value}°`;
}

// Update asteroid information
function updateAsteroidInfo() {
    const diameter = parseFloat(elements.sizeSlider.value);
    const velocity = parseFloat(elements.velocitySlider.value);
    
    // Calculate mass (assuming density of 3000 kg/m³)
    const radius = diameter * 1000 / 2; // Convert km to m
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    const density = 3000; // kg/m³
    const mass = volume * density;
    
    // Update display
    elements.asteroidDiameter.textContent = `${diameter} km`;
    elements.asteroidVelocity.textContent = `${velocity} km/s`;
    elements.asteroidMass.textContent = formatScientific(mass) + ' kg';
}

// Format scientific notation
function formatScientific(number) {
    if (number >= 1e12) {
        return (number / 1e12).toFixed(1) + 'e12';
    } else if (number >= 1e9) {
        return (number / 1e9).toFixed(1) + 'e9';
    } else if (number >= 1e6) {
        return (number / 1e6).toFixed(1) + 'e6';
    } else if (number >= 1e3) {
        return (number / 1e3).toFixed(1) + 'e3';
    }
    return number.toFixed(1);
}

// Simulate Impact
async function simulateImpact() {
    console.log('💥 Simulating amazing impact...');
    
    if (AppState.isSimulating) return;
    
    AppState.isSimulating = true;
    elements.simulateBtn.textContent = '⏳ Calculating...';
    elements.simulateBtn.disabled = true;
    
    try {
        // Get current parameters
        const diameter = parseFloat(elements.sizeSlider.value);
        const velocity = parseFloat(elements.velocitySlider.value);
        const angle = parseFloat(elements.angleSlider.value);
        
        // Create asteroid data
        const asteroidData = { diameter, velocity, density: 3000 };
        
        // Calculate impact effects using advanced physics
        const impactData = window.calculateImpactEffects(asteroidData);
        
        // Update display with calculated values
        elements.energyValue.textContent = formatScientific(impactData.kineticEnergy) + ' J';
        elements.tntValue.textContent = impactData.tntEquivalent.toFixed(2) + ' megatons';
        elements.craterValue.textContent = impactData.craterDiameter.toFixed(1) + ' km';
        
        // Update impact zones
        elements.zoneTotal.textContent = impactData.zones.totalDestruction.toFixed(1) + ' km';
        elements.zoneSevere.textContent = impactData.zones.severeDamage.toFixed(1) + ' km';
        elements.zoneModerate.textContent = impactData.zones.moderateDamage.toFixed(1) + ' km';
        
        // Update environmental effects
        elements.seismicMagnitude.textContent = impactData.effects.seismic.magnitude.toFixed(1) + ' Richter';
        
        // Tsunami risk
        const tsunamiRisk = impactData.effects.tsunami.height > 10 ? 'High' : 
                           impactData.effects.tsunami.height > 5 ? 'Medium' : 'Low';
        elements.tsunamiRisk.textContent = tsunamiRisk;
        
        // Atmospheric effects
        const atmosphericEffect = impactData.effects.atmospheric.nuclearWinter ? 'Nuclear Winter' : 
                                 impactData.effects.atmospheric.dustEjected > 1000 ? 'Dust Cloud' : 'Minimal';
        elements.atmosphericEffect.textContent = atmosphericEffect;
        
        // Show impact stats
        elements.impactStats.style.display = 'block';
        
        // Create amazing 3D impact visualization
        await simulateAmazing3DImpact(asteroidData, impactData);
        
        console.log('✅ Amazing impact simulation complete');
        
    } catch (error) {
        console.error('❌ Simulation failed:', error);
        showError('Simulation failed. Please try again.');
    } finally {
        AppState.isSimulating = false;
        elements.simulateBtn.textContent = '💥 Simulate Impact';
        elements.simulateBtn.disabled = false;
    }
}

// Test Deflection
async function testDeflection() {
    console.log('🛡️ Testing deflection...');
    
    const selectedStrategy = document.querySelector('input[name="strategy"]:checked').value;
    
    // Show deflection results
    const deflectionResults = document.getElementById('deflection-results');
    deflectionResults.style.display = 'block';
    
    // Simulate deflection success
    const successRate = Math.random() * 100;
    const missDistance = 5000 + Math.random() * 15000; // km
    const timeToImpact = 1 + Math.random() * 5; // days
    
    document.getElementById('deflection-success').textContent = successRate.toFixed(0) + '%';
    document.getElementById('miss-distance').textContent = missDistance.toFixed(0) + ' km';
    document.getElementById('time-to-impact').textContent = timeToImpact.toFixed(1) + ' days';
    
    // Update success color
    const successElement = document.getElementById('deflection-success');
    if (successRate > 80) {
        successElement.className = 'status-value success';
    } else if (successRate > 50) {
        successElement.className = 'status-value warning';
    } else {
        successElement.className = 'status-value danger';
    }
    
    console.log(`✅ Deflection test complete - ${selectedStrategy} strategy`);
}

// Start Game Mode
function startGameMode() {
    console.log('🎮 Starting amazing game mode...');
    
    if (window.gameModeManager) {
        window.gameModeManager.startGameMode();
    } else {
        // Fallback
        elements.gameOverlay.style.display = 'flex';
        AppState.isGameMode = true;
    }
}

// Start Game
function startGame() {
    console.log('🚀 Starting Defend Earth game...');
    
    if (window.gameModeManager) {
        window.gameModeManager.startGame();
    } else {
        // Fallback
        alert('Game mode not available');
    }
}

// Exit Game Mode
function exitGameMode() {
    console.log('❌ Exiting game mode...');
    
    if (window.gameModeManager) {
        window.gameModeManager.exitGameMode();
    } else {
        // Fallback
        elements.gameOverlay.style.display = 'none';
        AppState.isGameMode = false;
    }
}

// Reset Simulation
function resetSimulation() {
    console.log('🔄 Resetting simulation...');
    
    // Reset sliders
    elements.sizeSlider.value = 0.5;
    elements.velocitySlider.value = 15.2;
    elements.angleSlider.value = 45;
    
    // Update displays
    updateSizeValue();
    updateVelocityValue();
    updateAngleValue();
    
    // Hide results
    elements.impactStats.style.display = 'none';
    document.getElementById('deflection-results').style.display = 'none';
    
    // Reset 3D scene
    reset3DScene();
    
    console.log('✅ Simulation reset');
}

// Asteroid Selection
function onAsteroidSelect() {
    const selected = elements.asteroidSelect.value;
    console.log(`🪨 Selected asteroid: ${selected}`);
    
    if (selected === 'impactor-2025') {
        // NASA Impactor-2025 data
        elements.sizeSlider.value = 0.5;
        elements.velocitySlider.value = 15.2;
        elements.angleSlider.value = 45;
        elements.asteroidName.textContent = 'Impactor-2025';
    } else if (selected === 'custom') {
        elements.asteroidName.textContent = 'Custom Asteroid';
    }
    
    updateSizeValue();
    updateVelocityValue();
    updateAngleValue();
}

// Initialize API
function initializeAPI() {
    console.log('🌐 Initializing API client...');
    // API client will be implemented in api-client.js
}

// Load Default Asteroid
async function loadDefaultAsteroid() {
    console.log('🪨 Loading default asteroid data...');
    
    // Set default values
    elements.asteroidName.textContent = 'Impactor-2025';
    updateAsteroidInfo();
    
    console.log('✅ Default asteroid loaded');
}

// Simulate Amazing 3D Impact
async function simulateAmazing3DImpact(asteroidData, impactData) {
    console.log('🎯 Creating amazing 3D impact simulation...');
    
    try {
        // Create amazing asteroid
        const asteroid = window.createAmazingAsteroid(
            asteroidData.diameter * 0.1, // Scale for visualization
            { x: 0, y: 0, z: 2 }
        );
        
        // Set asteroid velocity
        window.setAsteroidVelocity({
            x: 0,
            y: 0,
            z: -0.05
        });
        
        // Create impact zone visualization
        const impactPosition = new THREE.Vector3(0, 0, 1);
        window.createAmazingImpactZone(impactData, impactPosition);
        
        // Simulate impact after delay
        setTimeout(() => {
            window.simulateAsteroidImpact();
        }, 2000);
        
        console.log('✅ Amazing 3D impact simulation created!');
        
    } catch (error) {
        console.error('❌ 3D impact simulation failed:', error);
    }
}

// Reset 3D Scene
function reset3DScene() {
    console.log('🔄 Resetting amazing 3D scene...');
    
    try {
        // Clear impact visualizations
        window.clearImpactVisualizations();
        
        // Clear orbit visualizations
        window.clearOrbitVisualizations();
        
        // Reset asteroid
        window.resetAsteroid();
        
        console.log('✅ 3D scene reset complete!');
        
    } catch (error) {
        console.error('❌ Failed to reset 3D scene:', error);
    }
}

// Show Loading Screen
function showLoadingScreen() {
    elements.loadingScreen.style.display = 'flex';
}

// Hide Loading Screen
function hideLoadingScreen() {
    elements.loadingScreen.style.display = 'none';
}

// Show Error
function showError(message) {
    console.error('❌ Error:', message);
    alert('Error: ' + message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for other modules
window.AppState = AppState;
window.elements = elements;