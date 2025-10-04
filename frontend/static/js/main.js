// Main application initialization for Asteroid Impact Simulator
// 
// DOM Ready handler
// - Initialize Three.js scene (call scene-setup.js)
// - Initialize UI controls (call controls.js)
// - Initialize API client
// - Load default asteroid data
// - Set up event listeners
// 
// Global state management
// - Current asteroid selection
// - Simulation state (running, paused)
// - Mitigation strategy applied
// 
// Main application functions
// - startSimulation()
// - resetSimulation()
// - updateDisplay()

// Global application state
const AppState = {
    currentAsteroid: null,
    simulationRunning: false,
    simulationPaused: false,
    currentTime: 0,
    simulationDuration: 365, // days
    mitigationStrategy: null,
    impactScenario: null,
    gameMode: false,
    gameLevel: 1,
    gameScore: 0
};

// DOM elements
let scene, camera, renderer, controls;
let earth, asteroid, orbitPath;
let simulationEngine;
let apiClient;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Asteroid Impact Simulator...');
    
    try {
        // Initialize Three.js scene
        initScene();
        
        // Initialize UI controls
        initControls();
        
        // Initialize API client
        initAPI();
        
        // Load default data
        loadDefaultData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Start animation loop
        animate();
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showNotification('Failed to initialize application', 'error');
    }
});

// Initialize Three.js scene
function initScene() {
    console.log('🎬 Initializing 3D scene...');
    
    // This will be implemented in scene-setup.js
    // For now, create placeholder
    const canvas = document.getElementById('three-canvas');
    if (!canvas) {
        throw new Error('Canvas element not found');
    }
    
    // Initialize scene components (will be called from scene-setup.js)
    // scene = new THREE.Scene();
    // camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    // renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    
    console.log('✅ 3D scene initialized');
}

// Initialize UI controls
function initControls() {
    console.log('🎛️ Initializing UI controls...');
    
    // This will be implemented in controls.js
    // For now, set up basic event listeners
    
    // Asteroid selection
    const asteroidSelect = document.getElementById('asteroid-select');
    if (asteroidSelect) {
        asteroidSelect.addEventListener('change', onAsteroidSelect);
    }
    
    // Parameter sliders
    const sizeSlider = document.getElementById('asteroid-size');
    const velocitySlider = document.getElementById('impact-velocity');
    const angleSlider = document.getElementById('impact-angle');
    
    if (sizeSlider) {
        sizeSlider.addEventListener('input', onSizeSliderChange);
        updateSliderValue('asteroid-size', 'size-value', 'km');
    }
    
    if (velocitySlider) {
        velocitySlider.addEventListener('input', onVelocitySliderChange);
        updateSliderValue('impact-velocity', 'velocity-value', 'km/s');
    }
    
    if (angleSlider) {
        angleSlider.addEventListener('input', onAngleSliderChange);
        updateSliderValue('impact-angle', 'angle-value', '°');
    }
    
    // Simulation buttons
    const simulateBtn = document.getElementById('simulate-impact-btn');
    const deflectBtn = document.getElementById('test-deflection-btn');
    const defendBtn = document.getElementById('defend-earth-btn');
    const resetBtn = document.getElementById('reset-simulation-btn');
    
    if (simulateBtn) {
        simulateBtn.addEventListener('click', onSimulateButtonClick);
    }
    
    if (deflectBtn) {
        deflectBtn.addEventListener('click', onDeflectButtonClick);
    }
    
    if (defendBtn) {
        defendBtn.addEventListener('click', onDefendEarthClick);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', onResetButtonClick);
    }
    
    console.log('✅ UI controls initialized');
}

// Initialize API client
function initAPI() {
    console.log('🌐 Initializing API client...');
    
    // This will be implemented in api-client.js
    // For now, create placeholder
    apiClient = {
        fetchAsteroids: () => Promise.resolve([]),
        fetchAsteroidDetails: (id) => Promise.resolve(null),
        simulateImpact: (params) => Promise.resolve(null),
        simulateMitigation: (params) => Promise.resolve(null)
    };
    
    console.log('✅ API client initialized');
}

// Load default data
async function loadDefaultData() {
    console.log('📊 Loading default data...');
    
    try {
        // Load asteroid list
        const asteroids = await apiClient.fetchAsteroids();
        updateAsteroidSelect(asteroids);
        
        // Load preset scenario
        loadPresetScenario('impactor-2025');
        
        console.log('✅ Default data loaded');
    } catch (error) {
        console.error('❌ Failed to load default data:', error);
        showNotification('Failed to load asteroid data', 'error');
    }
}

// Set up event listeners
function setupEventListeners() {
    console.log('👂 Setting up event listeners...');
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', onKeyDown);
    
    // Game mode events
    document.addEventListener('gameLevelComplete', onGameLevelComplete);
    document.addEventListener('gameOver', onGameOver);
    
    console.log('✅ Event listeners set up');
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (scene && camera && renderer) {
        // Update controls
        if (controls) {
            controls.update();
        }
        
        // Update simulation
        if (simulationEngine && AppState.simulationRunning) {
            simulationEngine.update();
        }
        
        // Update Earth rotation
        if (earth) {
            earth.rotation.y += 0.001;
        }
        
        // Update asteroid position
        if (asteroid && AppState.simulationRunning) {
            updateAsteroidPosition();
        }
        
        // Render scene
        renderer.render(scene, camera);
    }
}

// Event handlers
function onAsteroidSelect(event) {
    const asteroidId = event.target.value;
    console.log('🪨 Asteroid selected:', asteroidId);
    
    if (asteroidId) {
        loadAsteroid(asteroidId);
    }
}

function onSizeSliderChange(event) {
    const size = parseFloat(event.target.value);
    updateSliderValue('asteroid-size', 'size-value', 'km');
    
    if (AppState.currentAsteroid) {
        AppState.currentAsteroid.diameter = size;
        updateAsteroidModel();
    }
}

function onVelocitySliderChange(event) {
    const velocity = parseFloat(event.target.value);
    updateSliderValue('impact-velocity', 'velocity-value', 'km/s');
    
    if (AppState.currentAsteroid) {
        AppState.currentAsteroid.velocity = velocity;
    }
}

function onAngleSliderChange(event) {
    const angle = parseFloat(event.target.value);
    updateSliderValue('impact-angle', 'angle-value', '°');
    
    // Update impact angle for simulation
    if (AppState.impactScenario) {
        AppState.impactScenario.impact_angle = angle;
    }
}

function onSimulateButtonClick() {
    console.log('💥 Starting impact simulation...');
    
    if (!AppState.currentAsteroid) {
        showNotification('Please select an asteroid first', 'warning');
        return;
    }
    
    startSimulation();
}

function onDeflectButtonClick() {
    console.log('🛡️ Testing deflection strategy...');
    
    if (!AppState.currentAsteroid) {
        showNotification('Please select an asteroid first', 'warning');
        return;
    }
    
    testDeflection();
}

function onDefendEarthClick() {
    console.log('🎮 Starting Defend Earth game...');
    
    startGameMode();
}

function onResetButtonClick() {
    console.log('🔄 Resetting simulation...');
    
    resetSimulation();
}

// Main application functions
function startSimulation() {
    if (AppState.simulationRunning) {
        pauseSimulation();
        return;
    }
    
    AppState.simulationRunning = true;
    AppState.simulationPaused = false;
    
    // Update UI
    updateSimulationButtons();
    
    // Start simulation engine
    if (simulationEngine) {
        simulationEngine.start();
    }
    
    showNotification('Simulation started', 'success');
}

function pauseSimulation() {
    AppState.simulationPaused = true;
    AppState.simulationRunning = false;
    
    // Update UI
    updateSimulationButtons();
    
    // Pause simulation engine
    if (simulationEngine) {
        simulationEngine.pause();
    }
    
    showNotification('Simulation paused', 'info');
}

function resetSimulation() {
    AppState.simulationRunning = false;
    AppState.simulationPaused = false;
    AppState.currentTime = 0;
    AppState.impactScenario = null;
    
    // Reset simulation engine
    if (simulationEngine) {
        simulationEngine.reset();
    }
    
    // Reset UI
    updateSimulationButtons();
    clearImpactStats();
    
    // Reset 3D scene
    resetScene();
    
    showNotification('Simulation reset', 'info');
}

function updateDisplay() {
    // Update impact statistics
    if (AppState.impactScenario) {
        updateImpactStats(AppState.impactScenario);
    }
    
    // Update asteroid information
    if (AppState.currentAsteroid) {
        updateAsteroidInfo(AppState.currentAsteroid);
    }
    
    // Update timeline
    updateTimeline();
}

// Utility functions
function updateSliderValue(sliderId, valueId, unit) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(valueId);
    
    if (slider && valueSpan) {
        valueSpan.textContent = slider.value + unit;
    }
}

function updateSimulationButtons() {
    const simulateBtn = document.getElementById('simulate-impact-btn');
    
    if (simulateBtn) {
        if (AppState.simulationRunning) {
            simulateBtn.textContent = '⏸️ Pause Simulation';
            simulateBtn.className = 'secondary-btn';
        } else {
            simulateBtn.textContent = '💥 Simulate Impact';
            simulateBtn.className = 'primary-btn';
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#00ff88',
        error: '#ff4444',
        warning: '#ffaa00',
        info: '#00d4ff'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Placeholder functions (to be implemented in other files)
function loadAsteroid(asteroidId) { console.log('Loading asteroid:', asteroidId); }
function updateAsteroidModel() { console.log('Updating asteroid model'); }
function testDeflection() { console.log('Testing deflection'); }
function startGameMode() { console.log('Starting game mode'); }
function loadPresetScenario(scenarioName) { console.log('Loading preset:', scenarioName); }
function updateAsteroidSelect(asteroids) { console.log('Updating asteroid select'); }
function updateAsteroidPosition() { console.log('Updating asteroid position'); }
function updateImpactStats(scenario) { console.log('Updating impact stats'); }
function updateAsteroidInfo(asteroid) { console.log('Updating asteroid info'); }
function updateTimeline() { console.log('Updating timeline'); }
function clearImpactStats() { console.log('Clearing impact stats'); }
function resetScene() { console.log('Resetting scene'); }
function onWindowResize() { console.log('Window resized'); }
function onKeyDown(event) { console.log('Key pressed:', event.key); }
function onGameLevelComplete() { console.log('Game level complete'); }
function onGameOver() { console.log('Game over'); }
