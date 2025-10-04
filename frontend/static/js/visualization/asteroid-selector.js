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
        
        // Setup preview canvas
        this.setupPreviewCanvas();
        
        // Populate dropdown
        this.populateDropdown();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('✅ Asteroid selector initialized');
    }

    async loadAsteroidData() {
        try {
            console.log('📡 Loading asteroid data from NASA...');
            const response = await fetch(`${this.simulation.apiBaseUrl}/asteroids/neo?limit=20`);
            const data = await response.json();
            
            if (data.success) {
                this.asteroids = data.asteroids;
                console.log(`✅ Loaded ${this.asteroids.length} asteroids`);
                
                // Sort by diameter (largest first)
                this.asteroids.sort((a, b) => b.diameter_km - a.diameter_km);
            } else {
                console.warn('⚠️ Failed to load asteroid data, using fallback');
                this.asteroids = this.getFallbackAsteroids();
            }
        } catch (error) {
            console.error('❌ Error loading asteroid data:', error);
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
                absolute_magnitude: 19.2,
                spectral_type: "C",
                composition: "carbonaceous"
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
        
        // Clear existing options
        select.innerHTML = '<option value="">Select an asteroid...</option>';
        
        // Add asteroid options
        this.asteroids.forEach((asteroid, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${asteroid.name || asteroid.designation} (${asteroid.diameter_km.toFixed(2)} km)`;
            if (asteroid.is_potentially_hazardous) {
                option.textContent += ' ⚠️ PHA';
            }
            select.appendChild(option);
        });
        
        console.log(`✅ Populated dropdown with ${this.asteroids.length} asteroids`);
    }

    setupEventListeners() {
        const select = document.getElementById('asteroidSelect');
        if (!select) return;
        
        select.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (index >= 0 && index < this.asteroids.length) {
                this.selectAsteroid(this.asteroids[index]);
            }
        });
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
            this.simulation.createAsteroidVisualization(asteroid);
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
