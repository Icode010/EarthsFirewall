/**
 * Complete Asteroid Impact Simulator
 * Features: Real NASA data, 3D visualization, impact physics, UI controls
 */

class AsteroidImpactSimulator {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 3D Objects
        this.earth = null;
        this.asteroid = null;
        this.asteroidTrajectory = null;
        this.impactEffects = [];
        
        // Animation
        this.animationId = null;
        this.isAnimating = false;
        this.animationSpeed = 1.0;
        
        // Data
        this.asteroids = [];
        this.currentAsteroid = null;
        this.asteroidSelector = null;
        this.trajectorySystem = null;
        this.impactAnimationSystem = null;
        this.simulationResults = null;
        
        // API
        this.apiBaseUrl = 'http://127.0.0.1:5000/api';
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Asteroid Impact Simulator...');
            
            await this.setupThreeJS();
            await this.loadEarthModel();
            await this.setupUI();
            await this.initAsteroidSelector();
            await this.initTrajectorySystem();
            await this.initImpactAnimationSystem();
            
            this.animate();
            this.showMessage('Simulator ready! Select an asteroid to begin.', 'success');
            
            console.log('✅ Asteroid Impact Simulator initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize simulator:', error);
            this.showMessage('Failed to initialize simulator: ' + error.message, 'error');
        }
    }
    
    async setupThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 6);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Controls
        if (typeof OrbitControls !== 'undefined') {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.enableZoom = true;
            this.controls.enablePan = true;
            this.controls.autoRotate = true;
            this.controls.autoRotateSpeed = 0.5;
            this.controls.maxDistance = 50;
            this.controls.minDistance = 2;
        }
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Additional light for better Earth visibility
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-5, -5, -5);
        this.scene.add(fillLight);
        
        // Enhanced starfield
        this.createEnhancedStarField();
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    async loadEarthModel() {
        console.log('🌍 Starting enhanced Earth model loading...');
        
        try {
            if (typeof createEarthModel === 'function') {
                console.log('📸 Loading enhanced Earth model from Assets...');
                const textureLoader = new THREE.TextureLoader();
                const earthGroup = await new Promise((resolve, reject) => {
                    createEarthModel(textureLoader, (earth) => {
                        if (earth) {
                            console.log('✅ Enhanced Earth model with textures created');
                            resolve(earth);
                        } else {
                            console.warn('⚠️ Enhanced Earth model creation failed');
                            resolve(null);
                        }
                    });
                });
                
                if (earthGroup) {
                    this.earth = earthGroup;
                    this.earth.scale.setScalar(2);
                    this.earth.name = 'Earth';
                    this.scene.add(this.earth);
                    console.log('✅ Enhanced Earth model loaded with all textures');
                    
                    // Start Earth animation
                    this.earthAnimationController = new EarthAnimationController(this.earth);
                    this.earthAnimationController.startAnimation();
                    
                    return;
                }
            } else {
                console.log('ℹ️ Enhanced Earth model function not available');
            }
        } catch (error) {
            console.error('❌ Enhanced Earth model failed:', error);
        }
        
        // Fallback to basic Earth
        console.log('🔄 Using fallback basic Earth model');
        this.createBasicEarth();
    }
    
    createEnhancedEarth() {
        console.log('🌍 Creating enhanced Earth model...');
        
        // Create Earth geometry
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Create Earth material with realistic colors
        const material = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            shininess: 100,
            specular: new THREE.Color(0x222222),
            emissive: new THREE.Color(0x001122),
            emissiveIntensity: 0.1,
            transparent: false,
            alphaTest: 0
        });
        
        // Create Earth mesh
        this.earth = new THREE.Mesh(geometry, material);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earth.name = 'Earth';
        this.earth.position.set(0, 0, 0); // Ensure Earth is at origin
        this.scene.add(this.earth);
        
        console.log('🌍 Earth mesh created and added to scene at position:', this.earth.position);
        
        // Add atmospheric glow effect
        const glowGeometry = new THREE.SphereGeometry(2.05, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.name = 'EarthGlow';
        this.scene.add(glow);
        
        console.log('✅ Enhanced Earth model created and added to scene');
        
        // Try to load Earth texture
        this.loadEarthTexture();
    }
    
    loadEarthTexture() {
        const textureLoader = new THREE.TextureLoader();
        
        textureLoader.load(
            '/static/assets/images/earthmap.jpg',
            (texture) => {
                console.log('📸 Earth texture loaded successfully');
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.flipY = false; // Prevent texture flipping
                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                
                // Update Earth material with texture
                if (this.earth && this.earth.material) {
                    this.earth.material.map = texture;
                    this.earth.material.transparent = false;
                    this.earth.material.alphaTest = 0;
                    this.earth.material.needsUpdate = true;
                    console.log('✅ Earth texture applied to model');
                }
            },
            undefined,
            (error) => {
                console.warn('⚠️ Could not load Earth texture:', error);
                console.log('ℹ️ Using solid color Earth model');
            }
        );
    }
    
    createBasicEarth() {
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Create a more realistic Earth material
        const material = new THREE.MeshPhongMaterial({
            color: 0x4a90e2,
            shininess: 100,
            specular: new THREE.Color(0x222222),
            emissive: new THREE.Color(0x001122),
            emissiveIntensity: 0.05,
            transparent: false,
            alphaTest: 0
        });
        
        this.earth = new THREE.Mesh(geometry, material);
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earth.name = 'Earth';
        this.scene.add(this.earth);
        
        // Add atmospheric glow effect
        const glowGeometry = new THREE.SphereGeometry(2.05, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.name = 'EarthGlow';
        this.scene.add(glow);
        
        console.log('✅ Enhanced basic Earth model created with atmospheric glow');
    }
    
    createEnhancedStarField() {
        console.log('⭐ Creating enhanced starfield...');
        
        if (typeof createStarfield === 'function') {
            const stars = createStarfield(5000);
            stars.name = 'EnhancedStarfield';
            this.scene.add(stars);
            console.log('✅ Enhanced starfield created');
        } else {
            // Fallback basic starfield
            this.createBasicStarField();
        }
    }
    
    createBasicStarField() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 200;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            sizeAttenuation: false
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'BasicStarfield';
        this.scene.add(stars);
        console.log('✅ Basic starfield created');
    }
    
    async setupUI() {
        // Get UI elements
        this.asteroidSelect = document.getElementById('asteroidSelect');
        this.impactLocation = document.getElementById('impactLocation');
        this.impactAngle = document.getElementById('impactAngle');
        this.impactVelocity = document.getElementById('impactVelocity');
        this.customDiameter = document.getElementById('customDiameter');
        this.customVelocity = document.getElementById('customVelocity');
        this.runSimulation = document.getElementById('runSimulation');
        this.resetSimulation = document.getElementById('resetSimulation');
        this.startAnimation = document.getElementById('startAnimation');
        this.toggleAnimation = document.getElementById('toggleAnimation');
        this.animationSpeed = document.getElementById('animationSpeed');
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Slider value displays
        this.impactAngle.addEventListener('input', (e) => {
            document.querySelector('.angle-value').textContent = e.target.value + '°';
        });
        
        this.impactVelocity.addEventListener('input', (e) => {
            document.querySelector('.velocity-value').textContent = e.target.value + ' km/s';
        });
        
        this.animationSpeed.addEventListener('input', (e) => {
            document.querySelector('.speed-value').textContent = e.target.value + 'x';
            this.animationSpeed = parseFloat(e.target.value);
        });
        
        // Button events
        this.runSimulation.addEventListener('click', () => this.runSimulationHandler());
        this.resetSimulation.addEventListener('click', () => this.resetSimulationHandler());
        this.startAnimation.addEventListener('click', () => this.startAnimationHandler());
        this.toggleAnimation.addEventListener('click', () => this.toggleAnimationHandler());
        
        // Asteroid selection
        this.asteroidSelect.addEventListener('change', (e) => {
            const selectedAsteroid = this.asteroids.find(a => a.designation === e.target.value);
            if (selectedAsteroid) {
                this.currentAsteroid = selectedAsteroid;
                this.updateUIForSelectedAsteroid();
            }
        });
    }
    
    async initAsteroidSelector() {
        try {
            console.log('🪨 Initializing asteroid selector...');
            
            if (typeof AsteroidSelector === 'undefined') {
                console.warn('⚠️ AsteroidSelector not available, using basic selector');
                await this.loadAsteroidData();
                return;
            }
            
            this.asteroidSelector = new AsteroidSelector(this);
            await this.asteroidSelector.init();
            console.log('✅ Asteroid selector initialized');
        } catch (error) {
            console.error('❌ Failed to initialize asteroid selector:', error);
            await this.loadAsteroidData(); // Fallback to basic method
        }
    }

    async initTrajectorySystem() {
        try {
            console.log('🚀 Initializing trajectory system...');
            
            if (typeof TrajectorySystem === 'undefined') {
                console.warn('⚠️ TrajectorySystem not available');
                return;
            }
            
            this.trajectorySystem = new TrajectorySystem(this);
            console.log('✅ Trajectory system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize trajectory system:', error);
        }
    }

    async initImpactAnimationSystem() {
        try {
            console.log('💥 Initializing impact animation system...');
            
            if (typeof ImpactAnimationSystem === 'undefined') {
                console.warn('⚠️ ImpactAnimationSystem not available');
                return;
            }
            
            this.impactAnimationSystem = new ImpactAnimationSystem(this);
            console.log('✅ Impact animation system initialized');
        } catch (error) {
            console.error('❌ Failed to initialize impact animation system:', error);
        }
    }

    async loadAsteroidData() {
        try {
            console.log('📡 Loading asteroid data from NASA...');
            const response = await fetch(`${this.apiBaseUrl}/asteroids/neo?limit=20`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.asteroids) {
                this.asteroids = data.asteroids;
                this.populateAsteroidSelect();
                console.log(`✅ Loaded ${data.asteroids.length} asteroids from NASA`);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('❌ Failed to load asteroid data:', error);
            this.showMessage('Failed to load NASA data. Using fallback asteroids.', 'error');
            this.loadFallbackAsteroids();
        }
    }
    
    loadFallbackAsteroids() {
        this.asteroids = [
            {
                designation: '433',
                name: 'Eros',
                diameter_km: 16.84,
                velocity_km_s: 15.2,
                is_potentially_hazardous: false,
                absolute_magnitude: 10.31,
                spectral_type: 'S',
                composition: 'rock'
            },
            {
                designation: '99942',
                name: 'Apophis',
                diameter_km: 0.37,
                velocity_km_s: 12.6,
                is_potentially_hazardous: true,
                absolute_magnitude: 19.7,
                spectral_type: 'S',
                composition: 'rock'
            },
            {
                designation: '101955',
                name: 'Bennu',
                diameter_km: 0.49,
                velocity_km_s: 17.8,
                is_potentially_hazardous: true,
                absolute_magnitude: 20.9,
                spectral_type: 'B',
                composition: 'carbonaceous'
            }
        ];
        
        this.populateAsteroidSelect();
        console.log('✅ Loaded fallback asteroids');
    }
    
    populateAsteroidSelect() {
        this.asteroidSelect.innerHTML = '<option value="">Select an asteroid...</option>';
        
        this.asteroids.forEach(asteroid => {
            const option = document.createElement('option');
            option.value = asteroid.designation;
            option.textContent = `${asteroid.name} (${asteroid.designation}) - ${asteroid.diameter_km.toFixed(2)}km`;
            if (asteroid.is_potentially_hazardous) {
                option.textContent += ' ⚠️ PHA';
            }
            this.asteroidSelect.appendChild(option);
        });
    }
    
    updateUIForSelectedAsteroid() {
        if (!this.currentAsteroid) return;
        
        // Update sliders with asteroid data
        this.impactVelocity.value = Math.round(this.currentAsteroid.velocity_km_s);
        document.querySelector('.velocity-value').textContent = this.currentAsteroid.velocity_km_s.toFixed(1) + ' km/s';
        
        // Update custom inputs
        this.customDiameter.value = this.currentAsteroid.diameter_km.toFixed(2);
        this.customVelocity.value = this.currentAsteroid.velocity_km_s.toFixed(1);
        
        // Create asteroid visualization
        this.createAsteroidVisualization(this.currentAsteroid);
        
        this.showMessage(`Selected ${this.currentAsteroid.name}`, 'info');
    }
    
    createAsteroidVisualization(asteroidData) {
        console.log(`🪨 Creating asteroid visualization for ${asteroidData.name}...`);
        
        // Remove existing asteroid
        if (this.asteroid) {
            this.scene.remove(this.asteroid);
        }
        
        // Create new asteroid with enhanced model
        if (typeof window.createAmazingAsteroid === 'function') {
            const size = Math.max(0.05, Math.min(0.3, Math.log(asteroidData.diameter_km + 1) * 0.02));
            this.asteroid = window.createAmazingAsteroid(size, {x: 8, y: 0, z: 0});
            
            // Update material based on composition
            if (this.asteroid && this.asteroid.material) {
                const composition = asteroidData.composition || 'rock';
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
                    default: // rock
                        color = 0x8b7355;
                        metalness = 0.3;
                        roughness = 0.7;
                }
                
                this.asteroid.material.color.setHex(color);
                this.asteroid.material.metalness = metalness;
                this.asteroid.material.roughness = roughness;
                this.asteroid.material.needsUpdate = true;
            }
            
            this.scene.add(this.asteroid);
            
            // Create trail and particles
            this.asteroidTrail = window.createAsteroidTrail(this.scene, this.asteroid);
            this.asteroidParticles = window.createAsteroidParticles(this.scene, this.asteroid);
            
            console.log(`✅ Created enhanced asteroid visualization for ${asteroidData.name}`);
        } else {
            // Fallback basic asteroid
            const geometry = new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
            this.asteroid = new THREE.Mesh(geometry, material);
            this.asteroid.position.set(8, 0, 0);
            this.scene.add(this.asteroid);
            console.log(`✅ Created basic asteroid visualization for ${asteroidData.name}`);
        }
        
        // Create realistic trajectory using trajectory system
        if (this.trajectorySystem) {
            this.trajectorySystem.createRealisticTrajectory(asteroidData);
            this.trajectorySystem.createOrbitalMechanicsVisualization(asteroidData);
        } else {
            // Fallback basic trajectory
            this.createAsteroidTrajectory();
        }
    }
    
    createAsteroidTrajectory() {
        if (this.asteroidTrajectory) {
            this.scene.remove(this.asteroidTrajectory);
        }
        
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const x = 8 * (1 - t);
            const y = Math.sin(t * Math.PI) * 2;
            const z = 0;
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xff6b6b, opacity: 0.6, transparent: true });
        this.asteroidTrajectory = new THREE.Line(geometry, material);
        this.scene.add(this.asteroidTrajectory);
    }
    
    async runSimulationHandler() {
        if (!this.currentAsteroid) {
            this.showMessage('Please select an asteroid first!', 'error');
            return;
        }
        
        try {
            this.showMessage('Running simulation...', 'info');
            
            // Get simulation parameters
            const impactParams = {
                impact_velocity: parseFloat(this.impactVelocity.value),
                impact_angle: parseFloat(this.impactAngle.value),
                impact_location: [0, 0], // Default to equator
                target_material: this.impactLocation.value
            };
            
            // Use custom values if provided
            if (this.customDiameter.value) {
                this.currentAsteroid.diameter_km = parseFloat(this.customDiameter.value);
            }
            if (this.customVelocity.value) {
                impactParams.impact_velocity = parseFloat(this.customVelocity.value);
            }
            
            // Calculate impact parameters using trajectory system
            let impactCalculations = null;
            if (this.trajectorySystem) {
                impactCalculations = this.trajectorySystem.calculateImpactParameters(
                    this.currentAsteroid, 
                    impactParams.impact_angle, 
                    impactParams.impact_velocity
                );
                console.log('🎯 NASA-grade impact calculations:', impactCalculations);
            }
            
            // Run simulation
            const results = await this.runSimulation(impactParams);
            
            if (results) {
                // Enhance results with trajectory system calculations
                if (impactCalculations) {
                    results.trajectoryCalculations = impactCalculations;
                }
                
                this.displayImpactResults(results);
                this.visualizeImpactEffects(results);
                
                // Simulation completed, ready for animation
                this.showMessage('Simulation completed! Click "Start Animation" to see impact sequence.', 'success');
            }
            
        } catch (error) {
            console.error('❌ Simulation failed:', error);
            this.showMessage('Simulation failed: ' + error.message, 'error');
        }
    }
    
    async runSimulation(impactParams) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/simulation/impact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asteroid: this.currentAsteroid,
                    impact_velocity: impactParams.impact_velocity,
                    impact_angle: impactParams.impact_angle,
                    impact_location: impactParams.impact_location,
                    target_material: impactParams.target_material
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const results = await response.json();
            
            if (results.success) {
                this.simulationResults = results.simulation || results.data;
                this.displayImpactResults(this.simulationResults);
                this.visualizeImpactEffects(this.simulationResults);
                this.showMessage('Simulation completed successfully!', 'success');
            } else {
                throw new Error(results.error || 'Unknown simulation error');
            }
            
        } catch (error) {
            console.error('❌ API simulation failed, using local calculation:', error);
            // Fallback to local calculation
            this.runLocalSimulation(impactParams);
        }
    }
    
    runLocalSimulation(impactParams) {
        // Local impact physics calculation
        const asteroid = this.currentAsteroid;
        const velocity = impactParams.impact_velocity;
        const angle = impactParams.impact_angle;
        
        // Calculate impact energy
        const radius = asteroid.diameter_km / 2;
        const volume = (4/3) * Math.PI * Math.pow(radius * 1000, 3); // m³
        const density = 3000; // kg/m³ average
        const mass = volume * density; // kg
        const energy = 0.5 * mass * Math.pow(velocity * 1000, 2); // Joules
        
        // Calculate crater size
        const craterDiameter = Math.pow(energy / 1e12, 0.294) * 1.2; // km
        const craterDepth = craterDiameter * 0.2; // km
        
        // Calculate seismic magnitude
        const magnitude = Math.log10(energy) / 1.5 - 4.8;
        
        // Create results
        this.simulationResults = {
            asteroid: {
                name: asteroid.name,
                diameter_km: asteroid.diameter_km,
                mass_kg: mass,
                velocity_km_s: velocity,
                impact_angle_deg: angle
            },
            energy: {
                kinetic_energy_joules: energy,
                tnt_equivalent_megatons: energy / (4.184e15),
                equivalent_magnitude: magnitude
            },
            crater: {
                diameter_km: craterDiameter,
                depth_km: craterDepth,
                volume_km3: (4/3) * Math.PI * Math.pow(craterDiameter/2, 2) * craterDepth
            },
            seismic: {
                magnitude: magnitude,
                pga: Math.pow(10, magnitude - 4) / 9.81,
                mmi: Math.min(12, magnitude * 1.5 + 2),
                felt_radius_km: Math.pow(10, magnitude - 3),
                damage_level: magnitude > 7 ? 'Severe' : magnitude > 6 ? 'Moderate' : 'Light'
            }
        };
        
        this.displayImpactResults(this.simulationResults);
        this.visualizeImpactEffects(this.simulationResults);
        this.showMessage('Local simulation completed!', 'success');
    }
    
    displayImpactResults(results) {
        const resultsDiv = document.getElementById('impactResults');
        
        resultsDiv.innerHTML = `
            <div class="result-card">
                <h4>💥 Impact Energy</h4>
                <p><strong>Kinetic Energy:</strong> ${(results.energy.kinetic_energy_joules / 1e15).toFixed(2)} × 10¹⁵ J</p>
                <p><strong>TNT Equivalent:</strong> ${results.energy.tnt_equivalent_megatons.toFixed(2)} MT</p>
                <p><strong>Earthquake Magnitude:</strong> ${results.energy.equivalent_magnitude.toFixed(1)}</p>
            </div>
            
            <div class="result-card">
                <h4>🕳️ Crater Formation</h4>
                <p><strong>Diameter:</strong> ${results.crater.diameter_km.toFixed(2)} km</p>
                <p><strong>Depth:</strong> ${results.crater.depth_km.toFixed(2)} km</p>
                <p><strong>Volume:</strong> ${results.crater.volume_km3.toFixed(2)} km³</p>
            </div>
            
            <div class="result-card">
                <h4>🌍 Seismic Effects</h4>
                <p><strong>Earthquake Magnitude:</strong> ${results.seismic.magnitude.toFixed(1)}</p>
                <p><strong>Peak Ground Acceleration:</strong> ${results.seismic.pga.toFixed(2)}g</p>
                <p><strong>Modified Mercalli Intensity:</strong> ${results.seismic.mmi.toFixed(1)}</p>
                <p><strong>Felt Radius:</strong> ${results.seismic.felt_radius_km.toFixed(0)} km</p>
                <p><strong>Damage Level:</strong> ${results.seismic.damage_level}</p>
            </div>
            
            ${results.tsunami_effects ? `
            <div class="result-card">
                <h4>🌊 Tsunami Effects</h4>
                <p><strong>Initial Wave Height:</strong> ${results.tsunami_effects.initial_wave_height_m.toFixed(1)} m</p>
                <p><strong>Runup Height:</strong> ${results.tsunami_effects.runup_height_m.toFixed(1)} m</p>
                <p><strong>Inundation Distance:</strong> ${results.tsunami_effects.inundation_distance_km.toFixed(1)} km</p>
            </div>
            ` : ''}
        `;
    }
    
    visualizeImpactEffects(results) {
        // Clear existing effects
        this.clearImpactEffects();
        
        // Create impact crater visualization
        this.createImpactCrater(results.crater);
        
        // Create seismic wave rings
        this.createSeismicVisualization(results.seismic);
        
        // Create blast radius
        this.createBlastRadius(results.energy);
    }
    
    clearImpactEffects() {
        this.impactEffects.forEach(effect => {
            this.scene.remove(effect);
        });
        this.impactEffects = [];
    }
    
    createImpactCrater(crater) {
        const craterGeometry = new THREE.CylinderGeometry(
            crater.diameter_km * 0.5, // top radius
            crater.diameter_km * 0.3, // bottom radius
            crater.depth_km * 0.1, // height
            32
        );
        
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        const craterMesh = new THREE.Mesh(craterGeometry, craterMaterial);
        craterMesh.position.set(0, -crater.depth_km * 0.05, 0);
        craterMesh.rotation.x = Math.PI / 2;
        craterMesh.name = 'ImpactCrater';
        
        this.scene.add(craterMesh);
        this.impactEffects.push(craterMesh);
    }
    
    createSeismicVisualization(seismic) {
        const feltRadius = Math.min(seismic.felt_radius_km, 2000); // Cap at 2000km
        
        for (let radius = 100; radius <= feltRadius; radius += 100) {
            const ringGeometry = new THREE.RingGeometry(
                radius * 0.001,
                radius * 0.001 + 0.01,
                32
            );
            
            let ringColor = 0x00ff00; // Green for light
            if (seismic.mmi > 8) ringColor = 0xff0000; // Red for severe
            else if (seismic.mmi > 6) ringColor = 0xff6600; // Orange for moderate
            
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: ringColor,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            
            const seismicRing = new THREE.Mesh(ringGeometry, ringMaterial);
            seismicRing.rotation.x = Math.PI / 2;
            seismicRing.name = `SeismicWave${radius}`;
            
            this.scene.add(seismicRing);
            this.impactEffects.push(seismicRing);
            
            // Animate the ring
            this.animateSeismicWave(seismicRing, seismic.mmi);
        }
    }
    
    createBlastRadius(energy) {
        const blastRadius = Math.pow(energy.kinetic_energy_joules / 1e12, 0.33) * 10; // km
        
        const blastGeometry = new THREE.CircleGeometry(blastRadius * 0.001, 32);
        const blastMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const blastMesh = new THREE.Mesh(blastGeometry, blastMaterial);
        blastMesh.rotation.x = Math.PI / 2;
        blastMesh.name = 'BlastRadius';
        
        this.scene.add(blastMesh);
        this.impactEffects.push(blastMesh);
    }
    
    animateSeismicWave(ring, intensity) {
        const animate = () => {
            ring.material.opacity = 0.3 + 0.2 * Math.sin(Date.now() * 0.002);
            ring.scale.setScalar(1 + 0.1 * Math.sin(Date.now() * 0.003));
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    animateImpactSequence() {
        console.log('🎬 Starting impact sequence animation...');
        
        if (!this.asteroid || !this.trajectorySystem) return;
        
        // Get trajectory points for animation
        const trajectoryPoints = this.trajectorySystem.getTrajectoryPoints(this.currentAsteroid);
        
        // Animate asteroid along trajectory
        this.trajectorySystem.animateAsteroidAlongTrajectory(this.asteroid, trajectoryPoints, 8000);
        
        // Create impact effects after animation completes
        setTimeout(() => {
            this.createImpactExplosion();
            this.createImpactCrater();
            this.createShockwave();
        }, 8000);
        
        console.log('✅ Impact sequence animation started');
    }

    createImpactExplosion() {
        console.log('💥 Creating impact explosion...');
        
        const explosionGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.9
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.set(0, 0, 0);
        explosion.name = 'ImpactExplosion';
        this.scene.add(explosion);
        
        // Animate explosion
        const startTime = Date.now();
        const animateExplosion = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const scale = 1 + elapsed * 8;
            const opacity = Math.max(0, 1 - elapsed * 1.5);
            
            explosion.scale.setScalar(scale);
            explosion.material.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(explosion);
            }
        };
        
        animateExplosion();
    }

    createImpactCrater() {
        console.log('🕳️ Creating impact crater...');
        
        const craterGeometry = new THREE.CylinderGeometry(0.5, 0.3, 0.1, 16);
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.8
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(0, -0.05, 0);
        crater.rotation.x = Math.PI / 2;
        crater.name = 'ImpactCrater';
        this.scene.add(crater);
    }

    createShockwave() {
        console.log('🌊 Creating shockwave...');
        
        const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const shockwaveMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        
        const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
        shockwave.position.set(0, 0, 0);
        shockwave.rotation.x = Math.PI / 2;
        shockwave.name = 'Shockwave';
        this.scene.add(shockwave);
        
        // Animate shockwave
        const startTime = Date.now();
        const animateShockwave = () => {
            const elapsed = (Date.now() - startTime) / 1000;
            const scale = elapsed * 3;
            const opacity = Math.max(0, 1 - elapsed * 0.3);
            
            shockwave.scale.setScalar(scale);
            shockwave.material.opacity = opacity;
            
            if (opacity > 0 && scale < 10) {
                requestAnimationFrame(animateShockwave);
            } else {
                this.scene.remove(shockwave);
            }
        };
        
        animateShockwave();
    }

    async startAnimationHandler() {
        if (!this.currentAsteroid) {
            this.showMessage('Please select an asteroid and run simulation first!', 'error');
            return;
        }
        
        if (!this.simulationResults) {
            this.showMessage('Please run simulation first!', 'error');
            return;
        }
        
        try {
            this.showMessage('Starting impact animation sequence...', 'info');
            
            // Get simulation parameters
            const impactParams = {
                impact_velocity: parseFloat(this.impactVelocity.value),
                impact_angle: parseFloat(this.impactAngle.value),
                impact_location: [0, 0],
                target_material: this.impactLocation.value
            };
            
            // Start comprehensive impact animation
            if (this.impactAnimationSystem) {
                await this.impactAnimationSystem.startImpactAnimation(this.currentAsteroid, impactParams);
                this.showMessage('Animation completed!', 'success');
            } else {
                // Fallback to basic animation
                this.animateImpactSequence();
                this.showMessage('Animation completed!', 'success');
            }
        } catch (error) {
            console.error('Animation failed:', error);
            this.showMessage('Animation failed: ' + error.message, 'error');
        }
    }

    resetSimulationHandler() {
        // Reset UI
        this.asteroidSelect.value = '';
        this.impactAngle.value = 45;
        this.impactVelocity.value = 15;
        this.customDiameter.value = '';
        this.customVelocity.value = '';
        
        // Reset displays
        document.querySelector('.angle-value').textContent = '45°';
        document.querySelector('.velocity-value').textContent = '15 km/s';
        
        // Clear 3D objects
        if (this.asteroid && typeof window.cleanupAsteroid === 'function') {
            window.cleanupAsteroid(this.scene, this.asteroid);
        } else if (this.asteroid) {
            this.scene.remove(this.asteroid);
        }
        this.asteroid = null;
        
        // Clean up trajectory system
        if (this.trajectorySystem) {
            this.trajectorySystem.cleanup();
        }
        
        // Clean up impact animation system
        if (this.impactAnimationSystem) {
            this.impactAnimationSystem.clearImpactEffects();
        }
        
        if (this.asteroidTrajectory) {
            this.scene.remove(this.asteroidTrajectory);
            this.asteroidTrajectory = null;
        }
        
        // Remove impact objects
        const impactObjects = ['ImpactExplosion', 'ImpactCrater', 'Shockwave'];
        impactObjects.forEach(name => {
            const obj = this.scene.getObjectByName(name);
            if (obj) {
                this.scene.remove(obj);
            }
        });
        
        this.clearImpactEffects();
        
        // Reset camera
        this.camera.position.set(0, 0, 8);
        this.controls.target.set(0, 0, 0);
        
        // Clear results
        document.getElementById('impactResults').innerHTML = `
            <div class="loading-message">
                <p>🌍 Select an asteroid and run simulation to see results</p>
            </div>
        `;
        
        this.currentAsteroid = null;
        this.simulationResults = null;
        
        this.showMessage('Simulation reset', 'info');
    }
    
    toggleAnimationHandler() {
        this.isAnimating = !this.isAnimating;
        const button = this.toggleAnimation;
        
        if (this.isAnimating) {
            button.textContent = '⏸️ Pause';
            this.showMessage('Animation started', 'info');
        } else {
            button.textContent = '▶️ Play';
            this.showMessage('Animation paused', 'info');
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Earth animation is handled by EarthAnimationController if available
        // Otherwise, use basic rotation
        if (this.earth && !this.earthAnimationController) {
            this.earth.rotation.y += 0.005 * this.animationSpeed;
        }
        
        // Animate asteroid if present
        if (this.asteroid && this.isAnimating) {
            this.asteroid.rotation.x += 0.01 * this.animationSpeed;
            this.asteroid.rotation.y += 0.01 * this.animationSpeed;
        }
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.getElementById('statusMessage');
        messageDiv.textContent = message;
        messageDiv.className = `status-message ${type} show`;
        
        setTimeout(() => {
            messageDiv.classList.remove('show');
        }, 3000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const simulator = new AsteroidImpactSimulator('asteroid-impact-simulator');
});