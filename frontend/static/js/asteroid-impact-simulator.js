/**
 * Comprehensive Asteroid Impact Simulator
 * Integrates NASA data, 3D visualization, impact physics, and mitigation systems
 */

class AsteroidImpactSimulator {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        // Scene components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 3D Objects
        this.earth = null;
        this.asteroid = null;
        this.asteroidTrajectory = null;
        this.impactLocation = null;
        this.impactEffects = null;
        
        // Animation
        this.animationId = null;
        this.isAnimating = false;
        this.animationSpeed = 1.0;
        
        // Data
        this.currentAsteroid = null;
        this.impactParameters = null;
        this.simulationResults = null;
        
        // UI Elements
        this.controlsPanel = null;
        this.resultsPanel = null;
        
        // API Base URL
        this.apiBaseUrl = '/api';
        
        this.init();
    }
    
    async init() {
        try {
            await this.setupThreeJS();
            await this.loadEarthModel();
            await this.setupUI();
            await this.loadAsteroidData();
            this.animate();
            
            console.log('✅ Asteroid Impact Simulator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize simulator:', error);
        }
    }
    
    async setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
        this.camera.position.set(0, 5, 15);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.container.appendChild(this.renderer.domElement);
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 100;
        
        // Add lighting
        this.setupLighting();
        
        // Add starfield
        this.createStarfield();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        sunLight.position.set(-10, 5, 10);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 50;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        this.scene.add(sunLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0x4080ff, 0.3);
        rimLight.position.set(10, 5, -10);
        this.scene.add(rimLight);
        
        // Point light for depth
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }
    
    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        const starColors = [];
        
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
            
            const color = new THREE.Color();
            color.setHSL(0.6, 0.4, Math.random() * 0.5 + 0.5);
            starColors.push(color.r, color.g, color.b);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            vertexColors: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'Starfield';
        this.scene.add(stars);
    }
    
    async loadEarthModel() {
        try {
            // Try to load the enhanced Earth model from Assets
            if (window.EarthModelAssets) {
                const textureLoader = new THREE.TextureLoader();
                const earthGroup = await new Promise((resolve) => {
                    window.EarthModelAssets.createEarthModel(textureLoader, resolve);
                });
                
                if (earthGroup) {
                    this.earth = earthGroup;
                    this.earth.scale.setScalar(2);
                    this.earth.name = 'Earth';
                    this.scene.add(this.earth);
                    console.log('✅ Enhanced Earth model loaded');
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load enhanced Earth model, using fallback:', error);
        }
        
        // Fallback: Create basic Earth
        this.createBasicEarth();
    }
    
    createBasicEarth() {
        // Earth geometry
        const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Earth material with procedural texture
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            shininess: 100,
            specular: new THREE.Color(0x222222),
            emissive: new THREE.Color(0x001122),
            emissiveIntensity: 0.1
        });
        
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earth.name = 'BasicEarth';
        this.scene.add(this.earth);
        
        console.log('✅ Basic Earth model created');
    }
    
    async setupUI() {
        // Create controls panel
        this.controlsPanel = document.createElement('div');
        this.controlsPanel.className = 'simulator-controls';
        this.controlsPanel.innerHTML = `
            <div class="controls-section">
                <h3>🌍 Asteroid Impact Simulator</h3>
                
                <div class="control-group">
                    <label>Asteroid Selection:</label>
                    <select id="asteroidSelect">
                        <option value="">Select an asteroid...</option>
                    </select>
                    <button id="loadAsteroidsBtn">Load NASA Data</button>
                </div>
                
                <div class="control-group">
                    <label>Custom Asteroid:</label>
                    <div class="custom-asteroid-inputs">
                        <input type="number" id="customDiameter" placeholder="Diameter (km)" step="0.1">
                        <input type="number" id="customVelocity" placeholder="Velocity (km/s)" step="0.1">
                        <input type="number" id="customDensity" placeholder="Density (kg/m³)" step="100" value="2000">
                        <select id="customComposition">
                            <option value="rock">Rocky</option>
                            <option value="iron">Iron</option>
                            <option value="carbonaceous">Carbonaceous</option>
                        </select>
                    </div>
                    <button id="createCustomAsteroidBtn">Create Custom Asteroid</button>
                </div>
                
                <div class="control-group">
                    <label>Impact Parameters:</label>
                    <div class="impact-inputs">
                        <input type="number" id="impactAngle" placeholder="Impact Angle (°)" min="0" max="90" value="45">
                        <input type="number" id="impactLat" placeholder="Latitude" min="-90" max="90" value="0">
                        <input type="number" id="impactLon" placeholder="Longitude" min="-180" max="180" value="0">
                        <select id="targetMaterial">
                            <option value="rock">Rock</option>
                            <option value="water">Water</option>
                            <option value="ice">Ice</option>
                        </select>
                    </div>
                </div>
                
                <div class="control-group">
                    <button id="runSimulationBtn" class="primary-btn">🚀 Run Impact Simulation</button>
                    <button id="resetSimulationBtn">🔄 Reset</button>
                </div>
                
                <div class="animation-controls">
                    <button id="playPauseBtn">⏸️ Pause</button>
                    <label>Speed: <input type="range" id="animationSpeed" min="0.1" max="5" step="0.1" value="1"></label>
                </div>
            </div>
        `;
        
        // Create results panel
        this.resultsPanel = document.createElement('div');
        this.resultsPanel.className = 'simulation-results';
        this.resultsPanel.innerHTML = `
            <div class="results-section">
                <h3>📊 Impact Analysis</h3>
                <div id="impactResults"></div>
                
                <h3>🛡️ Mitigation Strategies</h3>
                <div id="mitigationResults"></div>
            </div>
        `;
        
        // Add panels to container
        this.container.appendChild(this.controlsPanel);
        this.container.appendChild(this.resultsPanel);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Asteroid selection
        document.getElementById('loadAsteroidsBtn').addEventListener('click', () => {
            this.loadAsteroidData();
        });
        
        document.getElementById('asteroidSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadSelectedAsteroid(e.target.value);
            }
        });
        
        // Custom asteroid creation
        document.getElementById('createCustomAsteroidBtn').addEventListener('click', () => {
            this.createCustomAsteroid();
        });
        
        // Simulation controls
        document.getElementById('runSimulationBtn').addEventListener('click', () => {
            this.runImpactSimulation();
        });
        
        document.getElementById('resetSimulationBtn').addEventListener('click', () => {
            this.resetSimulation();
        });
        
        // Animation controls
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.toggleAnimation();
        });
        
        document.getElementById('animationSpeed').addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
        });
    }
    
    async loadAsteroidData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/asteroids/neo?limit=20`);
            const data = await response.json();
            
            if (data.success) {
                this.populateAsteroidSelect(data.asteroids);
                console.log(`✅ Loaded ${data.count} near-Earth objects`);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to load asteroid data:', error);
            this.showError('Failed to load asteroid data from NASA');
        }
    }
    
    populateAsteroidSelect(asteroids) {
        const select = document.getElementById('asteroidSelect');
        select.innerHTML = '<option value="">Select an asteroid...</option>';
        
        asteroids.forEach(asteroid => {
            const option = document.createElement('option');
            option.value = asteroid.designation;
            option.textContent = `${asteroid.name || asteroid.designation} (${asteroid.diameter_km.toFixed(2)} km)`;
            if (asteroid.is_potentially_hazardous) {
                option.textContent += ' ⚠️';
            }
            select.appendChild(option);
        });
    }
    
    async loadSelectedAsteroid(designation) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/asteroids/${designation}`);
            const data = await response.json();
            
            if (data.success) {
                this.currentAsteroid = data.asteroid;
                this.createAsteroidVisualization(data.asteroid);
                console.log('✅ Loaded asteroid:', data.asteroid.name);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to load asteroid details:', error);
            this.showError('Failed to load asteroid details');
        }
    }
    
    async createCustomAsteroid() {
        const diameter = parseFloat(document.getElementById('customDiameter').value);
        const velocity = parseFloat(document.getElementById('customVelocity').value);
        const density = parseFloat(document.getElementById('customDensity').value);
        const composition = document.getElementById('customComposition').value;
        
        if (!diameter || !velocity || !density) {
            this.showError('Please fill in all custom asteroid parameters');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/simulation/custom-asteroid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    diameter_km: diameter,
                    density_kg_m3: density,
                    velocity_km_s: velocity,
                    composition: composition,
                    name: `Custom ${composition} Asteroid`
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentAsteroid = data.asteroid;
                this.createAsteroidVisualization(data.asteroid);
                console.log('✅ Created custom asteroid:', data.asteroid.name);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to create custom asteroid:', error);
            this.showError('Failed to create custom asteroid');
        }
    }
    
    createAsteroidVisualization(asteroidData) {
        // Remove existing asteroid
        if (this.asteroid) {
            this.scene.remove(this.asteroid);
        }
        if (this.asteroidTrajectory) {
            this.scene.remove(this.asteroidTrajectory);
        }
        
        // Use the existing asteroid model from asteroid-model.js
        if (window.createAmazingAsteroid) {
            // Calculate appropriate size based on diameter
            const size = Math.max(0.02, Math.min(0.5, Math.log(asteroidData.diameter_km + 1) * 0.05));
            
            // Create asteroid using the existing model
            this.asteroid = window.createAmazingAsteroid(size, {x: 8, y: 0, z: 0});
            
            // Update asteroid properties based on NASA data
            if (this.asteroid && this.asteroid.material) {
                // Update material based on composition
                const composition = asteroidData.composition || asteroidData.spectral_type;
                let color, metalness, roughness;
                
                switch (composition) {
                    case 'iron':
                        color = 0x666666;
                        metalness = 0.8;
                        roughness = 0.2;
                        break;
                    case 'carbonaceous':
                        color = 0x2d1b0e;
                        metalness = 0.1;
                        roughness = 0.9;
                        break;
                    default:
                        color = 0x8b7355;
                        metalness = 0.3;
                        roughness = 0.7;
                }
                
                this.asteroid.material.color.setHex(color);
                this.asteroid.material.metalness = metalness;
                this.asteroid.material.roughness = roughness;
                this.asteroid.material.needsUpdate = true;
            }
            
            // Set asteroid velocity based on NASA data
            const velocity = asteroidData.velocity_km_s || 15;
            window.setAsteroidVelocity({
                x: -velocity * 0.001, // Scale down for visualization
                y: 0,
                z: 0
            });
            
        } else {
            // Fallback: Create basic asteroid mesh
            const size = Math.max(0.1, Math.min(1.0, Math.log(asteroidData.diameter_km + 1) * 0.1));
            const geometry = new THREE.SphereGeometry(size, 16, 16);
            
            // Create asteroid material based on composition
            let material;
            switch (asteroidData.composition || asteroidData.spectral_type) {
                case 'iron':
                    material = new THREE.MeshStandardMaterial({
                        color: 0x666666,
                        metalness: 0.8,
                        roughness: 0.2
                    });
                    break;
                case 'carbonaceous':
                    material = new THREE.MeshStandardMaterial({
                        color: 0x2d1b0e,
                        metalness: 0.1,
                        roughness: 0.9
                    });
                    break;
                default:
                    material = new THREE.MeshStandardMaterial({
                        color: 0x8b7355,
                        metalness: 0.3,
                        roughness: 0.7
                    });
            }
            
            this.asteroid = new THREE.Mesh(geometry, material);
            this.asteroid.castShadow = true;
            this.asteroid.receiveShadow = true;
            this.asteroid.name = 'Asteroid';
            
            // Position asteroid away from Earth
            this.asteroid.position.set(8, 0, 0);
            this.scene.add(this.asteroid);
        }
        
        // Create trajectory line
        this.createAsteroidTrajectory(asteroidData);
        
        // Store asteroid data for reference
        this.currentAsteroidData = asteroidData;
    }
    
    createAsteroidTrajectory(asteroidData) {
        const points = [];
        const segments = 100;
        
        // Create trajectory curve (simplified)
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = 8 - (8 * t);
            const y = Math.sin(t * Math.PI) * 2;
            const z = 0;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xff6b6b,
            transparent: true,
            opacity: 0.7
        });
        
        this.asteroidTrajectory = new THREE.Line(geometry, material);
        this.asteroidTrajectory.name = 'AsteroidTrajectory';
        this.scene.add(this.asteroidTrajectory);
    }
    
    async runImpactSimulation() {
        if (!this.currentAsteroid) {
            this.showError('Please select or create an asteroid first');
            return;
        }
        
        const impactAngle = parseFloat(document.getElementById('impactAngle').value) || 45;
        const impactLat = parseFloat(document.getElementById('impactLat').value) || 0;
        const impactLon = parseFloat(document.getElementById('impactLon').value) || 0;
        const targetMaterial = document.getElementById('targetMaterial').value;
        
        this.impactParameters = {
            asteroid: this.currentAsteroid,
            impact_velocity: this.currentAsteroid.velocity_km_s,
            impact_angle: impactAngle,
            impact_location: [impactLat, impactLon],
            target_material: targetMaterial
        };
        
        try {
            console.log('🚀 Running impact simulation...');
            
            const response = await fetch(`${this.apiBaseUrl}/simulation/impact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.impactParameters)
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.simulationResults = data.simulation;
                this.displayImpactResults(data.simulation);
                this.visualizeImpactEffects(data.simulation);
                this.loadMitigationStrategies(data.simulation);
                console.log('✅ Impact simulation completed');
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to run impact simulation:', error);
            this.showError('Failed to run impact simulation');
        }
    }
    
    displayImpactResults(results) {
        const resultsDiv = document.getElementById('impactResults');
        
        const energy = results.energy;
        const crater = results.crater;
        const seismic = results.seismic;
        
        resultsDiv.innerHTML = `
            <div class="result-grid">
                <div class="result-card">
                    <h4>💥 Impact Energy</h4>
                    <p><strong>Kinetic Energy:</strong> ${(energy.kinetic_energy_joules / 1e15).toFixed(2)} × 10¹⁵ J</p>
                    <p><strong>TNT Equivalent:</strong> ${energy.tnt_equivalent_megatons.toFixed(2)} MT</p>
                    <p><strong>Earthquake Magnitude:</strong> ${energy.equivalent_magnitude.toFixed(1)}</p>
                </div>
                
                <div class="result-card">
                    <h4>🕳️ Crater Formation</h4>
                    <p><strong>Diameter:</strong> ${crater.diameter_km.toFixed(2)} km</p>
                    <p><strong>Depth:</strong> ${crater.depth_km.toFixed(2)} km</p>
                    <p><strong>Volume:</strong> ${crater.volume_km3.toFixed(2)} km³</p>
                </div>
                
                <div class="result-card">
                    <h4>🌍 Seismic Effects</h4>
                    <p><strong>Earthquake Magnitude:</strong> ${seismic.magnitude.toFixed(1)}</p>
                    <p><strong>Peak Ground Acceleration:</strong> ${seismic.pga.toFixed(2)}g</p>
                    <p><strong>Modified Mercalli Intensity:</strong> ${seismic.mmi.toFixed(1)}</p>
                    <p><strong>Felt Radius:</strong> ${seismic.felt_radius_km.toFixed(0)} km</p>
                    <p><strong>Damage Level:</strong> ${seismic.damage_level}</p>
                </div>
                
                ${results.tsunami_effects ? `
                <div class="result-card">
                    <h4>🌊 Tsunami Effects</h4>
                    <p><strong>Initial Wave Height:</strong> ${results.tsunami_effects.initial_wave_height_m.toFixed(1)} m</p>
                    <p><strong>Coastal Wave Height:</strong> ${results.tsunami_effects.coastal_wave_height_m.toFixed(1)} m</p>
                    <p><strong>Inundation Distance:</strong> ${results.tsunami_effects.inundation_distance_km.toFixed(1)} km</p>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    visualizeImpactEffects(results) {
        // Create impact location marker
        if (this.impactLocation) {
            this.scene.remove(this.impactLocation);
        }
        
        const lat = results.impact_location.latitude;
        const lon = results.impact_location.longitude;
        
        // Convert lat/lon to 3D position on Earth surface
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lon + 180) * Math.PI / 180;
        
        const x = 2.1 * Math.sin(phi) * Math.cos(theta);
        const y = 2.1 * Math.cos(phi);
        const z = 2.1 * Math.sin(phi) * Math.sin(theta);
        
        // Create impact marker
        const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        this.impactLocation = new THREE.Mesh(markerGeometry, markerMaterial);
        this.impactLocation.position.set(x, y, z);
        this.impactLocation.name = 'ImpactLocation';
        this.scene.add(this.impactLocation);
        
        // Create crater visualization
        this.createCraterVisualization(results.crater, x, y, z);
        
        // Create blast radius visualization
        this.createBlastRadiusVisualization(results.blast_effects);
        
        // Create seismic effects visualization
        this.createSeismicVisualization(results.seismic_effects);
    }
    
    createCraterVisualization(craterData, x, y, z) {
        // Create crater geometry (simplified)
        const craterRadius = craterData.diameter_km / 4; // Scale down for visualization
        const craterGeometry = new THREE.CylinderGeometry(0, craterRadius, craterData.depth_km, 32);
        
        const craterMaterial = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(x, y, z);
        crater.rotation.x = Math.PI / 2;
        crater.name = 'Crater';
        this.scene.add(crater);
    }
    
    createBlastRadiusVisualization(blastEffects) {
        // Create blast radius rings
        Object.keys(blastEffects).forEach(distance => {
            const distanceKm = parseInt(distance.replace('km', ''));
            const blastData = blastEffects[distance];
            
            if (blastData.damage_level !== "No significant damage") {
                const ringGeometry = new THREE.RingGeometry(distanceKm * 0.001, distanceKm * 0.001 + 0.01, 32);
                let ringColor;
                
                switch (blastData.damage_level) {
                    case "Complete destruction":
                        ringColor = 0xff0000;
                        break;
                    case "Severe damage":
                        ringColor = 0xff6600;
                        break;
                    case "Moderate damage":
                        ringColor = 0xffaa00;
                        break;
                    case "Light damage":
                        ringColor = 0xffff00;
                        break;
                    default:
                        ringColor = 0x00ff00;
                }
                
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: ringColor,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                });
                
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.rotation.x = Math.PI / 2;
                ring.name = `BlastRadius${distanceKm}`;
                this.scene.add(ring);
            }
        });
    }
    
    createSeismicVisualization(seismicEffects) {
        // Create seismic wave visualization
        Object.keys(seismicEffects).forEach(distance => {
            const distanceKm = parseInt(distance.replace('km', ''));
            const seismicData = seismicEffects[distance];
            
            if (seismicData.mmi >= 4) { // Only show if felt
                // Create seismic wave ring
                const ringGeometry = new THREE.RingGeometry(
                    distanceKm * 0.001, 
                    distanceKm * 0.001 + 0.01, 
                    32
                );
                
                // Color based on intensity
                let ringColor;
                if (seismicData.mmi >= 8) {
                    ringColor = 0xff0000; // Red for severe
                } else if (seismicData.mmi >= 6) {
                    ringColor = 0xff6600; // Orange for moderate
                } else if (seismicData.mmi >= 4) {
                    ringColor = 0xffff00; // Yellow for light
                } else {
                    ringColor = 0x00ff00; // Green for minor
                }
                
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: ringColor,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.DoubleSide
                });
                
                const seismicRing = new THREE.Mesh(ringGeometry, ringMaterial);
                seismicRing.rotation.x = Math.PI / 2;
                seismicRing.name = `SeismicWave${distanceKm}`;
                this.scene.add(seismicRing);
                
                // Add pulsing animation
                this.animateSeismicWave(seismicRing, seismicData.mmi);
            }
        });
    }
    
    animateSeismicWave(ring, magnitude) {
        let time = 0;
        const originalOpacity = ring.material.opacity;
        
        function animate() {
            time += 0.05;
            const pulse = Math.sin(time) * 0.1 + 0.3;
            ring.material.opacity = originalOpacity * pulse;
            
            if (ring.parent) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    async loadMitigationStrategies(impactResults) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/mitigation/strategies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    asteroid_mass_kg: impactResults.asteroid.mass_kg,
                    asteroid_diameter_km: impactResults.asteroid.diameter_km,
                    deflection_time_years: 5, // Default 5 years warning
                    impact_velocity_km_s: impactResults.asteroid.velocity_km_s
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayMitigationStrategies(data.strategies);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to load mitigation strategies:', error);
        }
    }
    
    displayMitigationStrategies(strategies) {
        const mitigationDiv = document.getElementById('mitigationResults');
        
        let html = '<div class="mitigation-grid">';
        
        Object.entries(strategies.strategies).forEach(([strategyName, strategyData]) => {
            const result = strategyData.result;
            const suitability = strategyData.suitability;
            
            html += `
                <div class="mitigation-card ${suitability}">
                    <h4>${this.getStrategyDisplayName(strategyName)}</h4>
                    <p><strong>Success:</strong> ${result.success ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Deflection Distance:</strong> ${result.deflection_distance_km.toFixed(1)} km</p>
                    <p><strong>Confidence:</strong> ${(result.confidence_level * 100).toFixed(1)}%</p>
                    <p><strong>Mission Cost:</strong> $${(result.mission_cost_usd / 1e9).toFixed(1)}B</p>
                    <p><strong>Duration:</strong> ${result.mission_duration_years.toFixed(1)} years</p>
                    <button onclick="simulator.simulateMitigationStrategy('${strategyName}')">Test Strategy</button>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (strategies.recommended_strategy) {
            html += `
                <div class="recommendation">
                    <h4>🎯 Recommended Strategy: ${this.getStrategyDisplayName(strategies.recommended_strategy)}</h4>
                    <p>${strategies.recommendation_reason}</p>
                </div>
            `;
        }
        
        mitigationDiv.innerHTML = html;
    }
    
    getStrategyDisplayName(strategyName) {
        const names = {
            'kinetic_impactor': 'Kinetic Impactor (DART-style)',
            'gravity_tractor': 'Gravity Tractor',
            'ion_beam': 'Ion Beam Shepherd',
            'nuclear': 'Nuclear Deflection'
        };
        return names[strategyName] || strategyName;
    }
    
    async simulateMitigationStrategy(strategyName) {
        if (!this.currentAsteroid || !this.simulationResults) {
            this.showError('Please run an impact simulation first');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/mitigation/simulate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    strategy_type: strategyName,
                    asteroid_mass_kg: this.currentAsteroid.mass_kg,
                    asteroid_diameter_km: this.currentAsteroid.diameter_km,
                    deflection_time_years: 5,
                    impact_velocity_km_s: this.currentAsteroid.velocity_km_s,
                    spacecraft_mass_kg: 1000,
                    approach_velocity_km_s: 6.6,
                    hover_distance_m: 100,
                    ion_beam_thrust_n: 0.5,
                    nuclear_yield_megatons: 1.0,
                    detonation_distance_m: 100
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.displayMitigationResult(strategyName, data.result);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Failed to simulate mitigation:', error);
            this.showError('Failed to simulate mitigation strategy');
        }
    }
    
    displayMitigationResult(strategyName, result) {
        const message = result.success 
            ? `✅ ${this.getStrategyDisplayName(strategyName)} would successfully deflect the asteroid by ${result.deflection_distance_km.toFixed(1)} km`
            : `❌ ${this.getStrategyDisplayName(strategyName)} would not provide sufficient deflection`;
        
        this.showMessage(message, result.success ? 'success' : 'error');
    }
    
    resetSimulation() {
        // Remove all impact effects
        ['ImpactLocation', 'Crater'].forEach(name => {
            const obj = this.scene.getObjectByName(name);
            if (obj) this.scene.remove(obj);
        });
        
        // Remove blast radius rings
        for (let i = 10; i <= 1000; i += 10) {
            const obj = this.scene.getObjectByName(`BlastRadius${i}`);
            if (obj) this.scene.remove(obj);
        }
        
        // Remove seismic wave rings
        for (let i = 10; i <= 2000; i += 10) {
            const obj = this.scene.getObjectByName(`SeismicWave${i}`);
            if (obj) this.scene.remove(obj);
        }
        
        // Clear results
        document.getElementById('impactResults').innerHTML = '';
        document.getElementById('mitigationResults').innerHTML = '';
        
        this.simulationResults = null;
        console.log('🔄 Simulation reset');
    }
    
    toggleAnimation() {
        this.isAnimating = !this.isAnimating;
        const btn = document.getElementById('playPauseBtn');
        btn.textContent = this.isAnimating ? '⏸️ Pause' : '▶️ Play';
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isAnimating) {
            // Rotate Earth
            if (this.earth) {
                this.earth.rotation.y += 0.001 * this.animationSpeed;
            }
            
            // Animate asteroid along trajectory
            if (this.asteroid && this.asteroidTrajectory) {
                // Simple animation along trajectory
                const time = Date.now() * 0.001 * this.animationSpeed;
                const progress = (Math.sin(time * 0.5) + 1) * 0.5;
                
                // Get position from trajectory
                const positions = this.asteroidTrajectory.geometry.attributes.position.array;
                const segmentIndex = Math.floor(progress * (positions.length / 3 - 1));
                const index = segmentIndex * 3;
                
                this.asteroid.position.set(
                    positions[index],
                    positions[index + 1],
                    positions[index + 2]
                );
                
                // Rotate asteroid
                this.asteroid.rotation.x += 0.01 * this.animationSpeed;
                this.asteroid.rotation.y += 0.01 * this.animationSpeed;
            }
            
            // Rotate starfield
            const starfield = this.scene.getObjectByName('Starfield');
            if (starfield) {
                starfield.rotation.y += 0.0001 * this.animationSpeed;
            }
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            max-width: 300px;
            ${type === 'error' ? 'background: #e74c3c;' : 
              type === 'success' ? 'background: #27ae60;' : 'background: #3498db;'}
        `;
        
        document.body.appendChild(messageEl);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        window.removeEventListener('resize', () => this.onWindowResize());
        
        console.log('🗑️ Simulator destroyed');
    }
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if container exists
    const container = document.getElementById('asteroid-impact-simulator');
    if (container) {
        window.simulator = new AsteroidImpactSimulator('asteroid-impact-simulator');
    }
});
