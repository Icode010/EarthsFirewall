// 🪨 Asteroid Selector - Advanced asteroid selection with 3D previews
console.log('🪨 Loading asteroid selector...');

class AsteroidSelector {
    constructor(simulation) {
        this.simulation = simulation;
        this.asteroids = [];
        this.selectedAsteroid = null;
        this.previewScene = null;
        this.previewRenderer = null;
        this.previewCamera = null;
        this.previewAsteroid = null;
        this.isInitialized = false;
    }

    async init() {
        console.log('🪨 Initializing asteroid selector...');
        
        // Load asteroid data
        await this.loadAsteroidData();
        console.log('🪨 Asteroid data loaded:', this.asteroids);
        
        // Setup preview canvas
        this.setupPreviewCanvas();
        
        // Populate dropdown
        this.populateDropdown();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ Asteroid selector initialized');
        
        // Test dropdown functionality
        this.testDropdownFunctionality();
    }

    async loadAsteroidData() {
        try {
            console.log('📡 Loading asteroid data from NASA...');
            
            // Try to load from API first
            if (this.simulation.apiBaseUrl) {
                const response = await fetch(`${this.simulation.apiBaseUrl}/asteroids/neo?limit=20`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.asteroids) {
                        this.asteroids = data.asteroids;
                        console.log(`✅ Loaded ${this.asteroids.length} asteroids from API`);
                        
                        // Sort by diameter (largest first)
                        this.asteroids.sort((a, b) => b.diameter_km - a.diameter_km);
                        return;
                    }
                }
            }
            
            // Fallback to static data
            console.warn('⚠️ API not available, using fallback asteroid data');
            this.asteroids = this.getFallbackAsteroids();
            
        } catch (error) {
            console.error('❌ Error loading asteroid data:', error);
            console.log('🔄 Using fallback asteroid data');
            this.asteroids = this.getFallbackAsteroids();
        }
    }

    getFallbackAsteroids() {
        return [
            {
                designation: "99942 Apophis",
                name: "Apophis",
                diameter_km: 0.37,
                velocity_km_s: 30.73,
                is_potentially_hazardous: true,
                close_approach_date: "2029-04-13",
                miss_distance_km: 31900,
                orbital_period_days: 323.6,
                absolute_magnitude: 19.7,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "101955 Bennu",
                name: "Bennu",
                diameter_km: 0.49,
                velocity_km_s: 28.0,
                is_potentially_hazardous: true,
                close_approach_date: "2135-09-25",
                miss_distance_km: 750000,
                orbital_period_days: 436.7,
                absolute_magnitude: 20.2,
                spectral_type: "B",
                composition: "carbonaceous"
            },
            {
                designation: "433 Eros",
                name: "Eros",
                diameter_km: 16.8,
                velocity_km_s: 24.36,
                is_potentially_hazardous: false,
                close_approach_date: "2024-01-15",
                miss_distance_km: 0.2,
                orbital_period_days: 643.0,
                absolute_magnitude: 11.16,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "25143 Itokawa",
                name: "Itokawa",
                diameter_km: 0.35,
                velocity_km_s: 29.8,
                is_potentially_hazardous: false,
                close_approach_date: "2024-03-20",
                miss_distance_km: 0.05,
                orbital_period_days: 556.4,
                absolute_magnitude: 19.2,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "162173 Ryugu",
                name: "Ryugu",
                diameter_km: 0.87,
                velocity_km_s: 27.5,
                is_potentially_hazardous: false,
                close_approach_date: "2024-06-10",
                miss_distance_km: 0.1,
                orbital_period_days: 474.0,
                absolute_magnitude: 19.2,
                spectral_type: "C",
                composition: "carbonaceous"
            },
            {
                designation: "4 Vesta",
                name: "Vesta",
                diameter_km: 525.4,
                velocity_km_s: 19.34,
                is_potentially_hazardous: false,
                close_approach_date: "2024-12-15",
                miss_distance_km: 1.5,
                orbital_period_days: 1325.0,
                absolute_magnitude: 3.2,
                spectral_type: "V",
                composition: "basaltic"
            },
            {
                designation: "1 Ceres",
                name: "Ceres",
                diameter_km: 939.4,
                velocity_km_s: 17.9,
                is_potentially_hazardous: false,
                close_approach_date: "2025-03-01",
                miss_distance_km: 2.7,
                orbital_period_days: 1680.0,
                absolute_magnitude: 3.36,
                spectral_type: "C",
                composition: "carbonaceous"
            },
            {
                designation: "2 Pallas",
                name: "Pallas",
                diameter_km: 512.0,
                velocity_km_s: 20.0,
                is_potentially_hazardous: false,
                close_approach_date: "2025-06-15",
                miss_distance_km: 1.8,
                orbital_period_days: 1686.0,
                absolute_magnitude: 4.13,
                spectral_type: "B",
                composition: "carbonaceous"
            },
            {
                designation: "3 Juno",
                name: "Juno",
                diameter_km: 233.9,
                velocity_km_s: 18.0,
                is_potentially_hazardous: false,
                close_approach_date: "2025-09-20",
                miss_distance_km: 1.2,
                orbital_period_days: 1594.0,
                absolute_magnitude: 5.33,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "5 Astraea",
                name: "Astraea",
                diameter_km: 119.0,
                velocity_km_s: 19.0,
                is_potentially_hazardous: false,
                close_approach_date: "2025-12-10",
                miss_distance_km: 0.8,
                orbital_period_days: 1514.0,
                absolute_magnitude: 6.85,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "6 Hebe",
                name: "Hebe",
                diameter_km: 185.2,
                velocity_km_s: 18.5,
                is_potentially_hazardous: false,
                close_approach_date: "2026-02-15",
                miss_distance_km: 1.0,
                orbital_period_days: 1377.0,
                absolute_magnitude: 5.71,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "7 Iris",
                name: "Iris",
                diameter_km: 200.0,
                velocity_km_s: 18.2,
                is_potentially_hazardous: false,
                close_approach_date: "2026-05-20",
                miss_distance_km: 1.1,
                orbital_period_days: 1345.0,
                absolute_magnitude: 5.51,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "8 Flora",
                name: "Flora",
                diameter_km: 135.9,
                velocity_km_s: 19.1,
                is_potentially_hazardous: false,
                close_approach_date: "2026-08-25",
                miss_distance_km: 0.9,
                orbital_period_days: 1193.0,
                absolute_magnitude: 6.49,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "9 Metis",
                name: "Metis",
                diameter_km: 190.0,
                velocity_km_s: 18.3,
                is_potentially_hazardous: false,
                close_approach_date: "2026-11-30",
                miss_distance_km: 1.05,
                orbital_period_days: 1345.0,
                absolute_magnitude: 5.68,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "10 Hygiea",
                name: "Hygiea",
                diameter_km: 434.0,
                velocity_km_s: 18.0,
                is_potentially_hazardous: false,
                close_approach_date: "2027-01-15",
                miss_distance_km: 1.6,
                orbital_period_days: 2031.0,
                absolute_magnitude: 5.43,
                spectral_type: "C",
                composition: "carbonaceous"
            },
            {
                designation: "11 Parthenope",
                name: "Parthenope",
                diameter_km: 153.3,
                velocity_km_s: 18.8,
                is_potentially_hazardous: false,
                close_approach_date: "2027-04-20",
                miss_distance_km: 0.95,
                orbital_period_days: 1385.0,
                absolute_magnitude: 6.55,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "12 Victoria",
                name: "Victoria",
                diameter_km: 112.8,
                velocity_km_s: 19.2,
                is_potentially_hazardous: false,
                close_approach_date: "2027-07-25",
                miss_distance_km: 0.85,
                orbital_period_days: 1218.0,
                absolute_magnitude: 7.0,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "13 Egeria",
                name: "Egeria",
                diameter_km: 207.6,
                velocity_km_s: 18.1,
                is_potentially_hazardous: false,
                close_approach_date: "2027-10-30",
                miss_distance_km: 1.1,
                orbital_period_days: 1514.0,
                absolute_magnitude: 6.74,
                spectral_type: "G",
                composition: "carbonaceous"
            },
            {
                designation: "14 Irene",
                name: "Irene",
                diameter_km: 152.0,
                velocity_km_s: 18.7,
                is_potentially_hazardous: false,
                close_approach_date: "2028-01-15",
                miss_distance_km: 0.98,
                orbital_period_days: 1350.0,
                absolute_magnitude: 6.3,
                spectral_type: "S",
                composition: "rock"
            },
            {
                designation: "15 Eunomia",
                name: "Eunomia",
                diameter_km: 255.0,
                velocity_km_s: 17.8,
                is_potentially_hazardous: false,
                close_approach_date: "2028-04-20",
                miss_distance_km: 1.3,
                orbital_period_days: 1570.0,
                absolute_magnitude: 5.28,
                spectral_type: "S",
                composition: "rock"
            }
        ];
    }

    setupPreviewCanvas() {
        // Create preview canvas
        const previewContainer = document.getElementById('asteroidPreview');
        if (!previewContainer) {
            console.warn('⚠️ Asteroid preview container not found');
            return;
        }

        // Create Three.js scene for preview
        this.previewScene = new THREE.Scene();
        this.previewScene.background = new THREE.Color(0x000011);
        
        // Preview camera
        this.previewCamera = new THREE.PerspectiveCamera(75, 200 / 150, 0.1, 1000);
        this.previewCamera.position.set(0, 0, 3);
        
        // Preview renderer
        this.previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.previewRenderer.setSize(200, 150);
        this.previewRenderer.shadowMap.enabled = true;
        this.previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        previewContainer.appendChild(this.previewRenderer.domElement);
        
        // Lighting for preview
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.previewScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.previewScene.add(directionalLight);
        
        const rimLight = new THREE.DirectionalLight(0xffa040, 0.3);
        rimLight.position.set(0, 5, -3);
        this.previewScene.add(rimLight);
        
        // Start preview animation
        this.animatePreview();
    }

    createAsteroidPreview(asteroidData) {
        console.log(`🪨 Creating preview for ${asteroidData.name}...`);
        
        // Remove existing preview asteroid
        if (this.previewAsteroid) {
            this.previewScene.remove(this.previewAsteroid);
        }
        
        // Calculate size based on diameter
        const size = Math.max(0.3, Math.min(1.5, Math.log(asteroidData.diameter_km + 1) * 0.3));
        
        // Create asteroid geometry with high detail
        const geometry = new THREE.SphereGeometry(size, 64, 64);
        
        // Add natural random variation to vertices
        const positions = geometry.attributes.position;
        const vertexCount = positions.count;
        
        // Create craters based on asteroid size
        const craterCount = Math.floor(120 * (size / 2));
        const craters = [];
        for (let i = 0; i < craterCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = size;
            
            craters.push({
                x: r * Math.sin(phi) * Math.cos(theta),
                y: r * Math.sin(phi) * Math.sin(theta),
                z: r * Math.cos(phi),
                radius: Math.random() * 0.6 + 0.15,
                depth: Math.random() * 0.12 + 0.05
            });
        }
        
        for (let i = 0; i < vertexCount; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const length = Math.sqrt(x * x + y * y + z * z);
            const nx = x / length;
            const ny = y / length;
            const nz = z / length;
            
            // Create oval shape
            const ovalFactorX = 1.3;
            const ovalFactorY = 0.85;
            const ovalFactorZ = 1.0;
            
            // Add bulges
            const bulge1 = Math.max(0, Math.sin(nx * 2.1 + 10) * Math.cos(ny * 1.8 + 20)) * 0.12;
            const bulge2 = Math.max(0, Math.sin(ny * 2.4 + 30) * Math.cos(nz * 2.2 + 40)) * 0.10;
            const bulge3 = Math.max(0, Math.sin(nz * 1.9 + 50) * Math.cos(nx * 2.3 + 60)) * 0.08;
            
            let displacement = 1.0 + bulge1 + bulge2 + bulge3;
            
            // Add smooth variations
            const smooth1 = Math.sin(x * 1.3 + 17.5) * Math.cos(y * 1.5 + 23.7) * 0.04;
            const smooth2 = Math.sin(y * 1.7 + 41.2) * Math.cos(z * 1.4 + 33.8) * 0.03;
            const smooth3 = Math.sin(z * 1.2 + 52.1) * Math.cos(x * 1.6 + 61.4) * 0.02;
            
            displacement += smooth1 + smooth2 + smooth3;
            
            // Add craters
            for (let j = 0; j < craters.length; j++) {
                const crater = craters[j];
                const dx = x - crater.x;
                const dy = y - crater.y;
                const dz = z - crater.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist < crater.radius) {
                    const craterEffect = 1 - (dist / crater.radius);
                    const craterDepth = Math.pow(craterEffect, 4) * crater.depth;
                    displacement -= craterDepth;
                    
                    if (dist > crater.radius * 0.8) {
                        const rimEffect = (dist - crater.radius * 0.8) / (crater.radius * 0.2);
                        displacement += Math.sin(rimEffect * Math.PI) * crater.depth * 0.08;
                    }
                }
            }
            
            displacement = Math.max(displacement, 0.7);
            
            positions.setXYZ(
                i, 
                nx * displacement * size * ovalFactorX, 
                ny * displacement * size * ovalFactorY, 
                nz * displacement * size * ovalFactorZ
            );
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
        
        // Create material based on composition
        let color, metalness, roughness;
        switch (asteroidData.composition) {
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
        
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness,
            flatShading: false
        });
        
        this.previewAsteroid = new THREE.Mesh(geometry, material);
        this.previewAsteroid.castShadow = true;
        this.previewAsteroid.receiveShadow = true;
        this.previewScene.add(this.previewAsteroid);
        
        console.log(`✅ Preview created for ${asteroidData.name}`);
    }

    populateDropdown() {
        const select = document.getElementById('asteroidSelect');
        if (!select) {
            console.warn('⚠️ Asteroid select dropdown not found');
            return;
        }
        
        console.log('🪨 Populating dropdown with asteroids:', this.asteroids);
        
        // Clear existing options
        select.innerHTML = '<option value="">Select an asteroid...</option>';
        
        // Add asteroid options with enhanced display including dates
        this.asteroids.forEach((asteroid, index) => {
            const option = document.createElement('option');
            option.value = index;
            
            // Create enhanced display name with clear asteroid names
            let displayName = asteroid.name || asteroid.designation;
            let displayInfo = `(${asteroid.diameter_km.toFixed(2)} km, ${asteroid.velocity_km_s.toFixed(1)} km/s)`;
            
            // Add composition info if available
            if (asteroid.composition) {
                displayInfo += ` - ${asteroid.composition}`;
            }
            
            // Add close approach date if available
            if (asteroid.close_approach_date) {
                const date = new Date(asteroid.close_approach_date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                displayInfo += ` | ${formattedDate}`;
            }
            
            // Add hazard warning
            if (asteroid.is_potentially_hazardous) {
                displayInfo += ' ⚠️ PHA';
            }
            
            option.textContent = `${displayName} ${displayInfo}`;
            select.appendChild(option);
            
            console.log(`🪨 Added asteroid option: ${displayName}`);
        });
        
        // Enable the select element
        select.disabled = false;
        select.style.pointerEvents = 'auto';
        
        console.log(`✅ Populated dropdown with ${this.asteroids.length} asteroids`);
        console.log('🪨 Dropdown element:', select);
        console.log('🪨 Dropdown options count:', select.options.length);
    }

    setupEventListeners() {
        const select = document.getElementById('asteroidSelect');
        if (!select) {
            console.error('❌ Asteroid select dropdown not found!');
            return;
        }
        
        console.log('✅ Setting up dropdown event listeners');
        
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            console.log(`🪨 Dropdown changed to index: ${index}`);
            if (index >= 0 && index < this.asteroids.length) {
                this.selectAsteroid(this.asteroids[index]);
            }
        });
        
        // Add click event for debugging
        select.addEventListener('click', (e) => {
            console.log('🪨 Dropdown clicked');
        });
        
        // Add focus event for debugging
        select.addEventListener('focus', (e) => {
            console.log('🪨 Dropdown focused');
        });
        
        // Add mousedown event for debugging
        select.addEventListener('mousedown', (e) => {
            console.log('🪨 Dropdown mousedown');
        });
    }

    // Test dropdown functionality
    testDropdownFunctionality() {
        const select = document.getElementById('asteroidSelect');
        if (!select) {
            console.error('❌ Cannot test dropdown - element not found');
            return;
        }
        
        console.log('🧪 Testing dropdown functionality...');
        console.log('🪨 Dropdown element:', select);
        console.log('🪨 Dropdown disabled:', select.disabled);
        console.log('🪨 Dropdown style pointerEvents:', select.style.pointerEvents);
        console.log('🪨 Dropdown options length:', select.options.length);
        console.log('🪨 Dropdown value:', select.value);
        
        // Test if dropdown can be opened programmatically
        try {
            select.focus();
            console.log('✅ Dropdown focus test passed');
        } catch (error) {
            console.error('❌ Dropdown focus test failed:', error);
        }
    }

    selectAsteroid(asteroid) {
        console.log(`🪨 Selecting asteroid: ${asteroid.name}`);
        this.selectedAsteroid = asteroid;
        
        // Update preview
        this.createAsteroidPreview(asteroid);
        
        // Update asteroid info display
        this.updateAsteroidInfo(asteroid);
        
        // Update simulation asteroid
        if (this.simulation) {
            this.simulation.currentAsteroid = asteroid; // Set the current asteroid
            this.simulation.createAsteroidVisualization(asteroid);
            this.simulation.updateUIForSelectedAsteroid();
        }
    }

    updateAsteroidInfo(asteroid) {
        const infoContainer = document.getElementById('asteroidInfo');
        if (!infoContainer) return;
        
        const hazardStatus = asteroid.is_potentially_hazardous ? 
            '<span class="hazard-yes">⚠️ Potentially Hazardous</span>' : 
            '<span class="hazard-no">✅ Safe</span>';
        
        const compositionColor = {
            'iron': '#666666',
            'carbonaceous': '#2d1b0e',
            'rock': '#8b7355'
        }[asteroid.composition] || '#8b7355';
        
        infoContainer.innerHTML = `
            <div class="asteroid-info">
                <h3>${asteroid.name || asteroid.designation}</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Designation:</label>
                        <span>${asteroid.designation}</span>
                    </div>
                    <div class="info-item">
                        <label>Diameter:</label>
                        <span>${asteroid.diameter_km.toFixed(2)} km</span>
                    </div>
                    <div class="info-item">
                        <label>Velocity:</label>
                        <span>${asteroid.velocity_km_s.toFixed(2)} km/s</span>
                    </div>
                    <div class="info-item">
                        <label>Magnitude:</label>
                        <span>${asteroid.absolute_magnitude.toFixed(1)}</span>
                    </div>
                    <div class="info-item">
                        <label>Type:</label>
                        <span>${asteroid.spectral_type}</span>
                    </div>
                    <div class="info-item">
                        <label>Composition:</label>
                        <span style="color: ${compositionColor}">${asteroid.composition}</span>
                    </div>
                    <div class="info-item">
                        <label>Hazard Status:</label>
                        ${hazardStatus}
                    </div>
                </div>
            </div>
        `;
    }

    animatePreview() {
        if (!this.previewRenderer || !this.previewScene || !this.previewCamera) return;
        
        requestAnimationFrame(() => this.animatePreview());
        
        // Rotate preview asteroid
        if (this.previewAsteroid) {
            this.previewAsteroid.rotation.y += 0.01;
            this.previewAsteroid.rotation.x += 0.005;
        }
        
        this.previewRenderer.render(this.previewScene, this.previewCamera);
    }

    getSelectedAsteroid() {
        return this.selectedAsteroid;
    }

    destroy() {
        if (this.previewRenderer) {
            this.previewRenderer.dispose();
        }
    }
}

// Export for global use
window.AsteroidSelector = AsteroidSelector;

console.log('🪨 Asteroid selector module loaded!');
