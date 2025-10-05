/**
 * Impactor-2025 Mitigation Simulator
 * NASA Space Apps Challenge - Meteor Madness
 * 
 * A professional 3D simulator for testing asteroid mitigation techniques
 * against the hypothetical "Impactor-2025" asteroid threat.
 */

class ImpactorMitigationSimulator {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationId = null;
        
        // Simulation objects
        this.earth = null;
        this.impactor2025 = null;
        this.trajectory = null;
        this.trajectoryArrows = [];
        
        // Mitigation system
        this.currentTechnique = 'none';
        this.mitigationApplied = false;
        this.originalTrajectory = null;
        this.modifiedTrajectory = null;
        
        // Physics parameters
        this.impactorData = {
            name: 'Impactor-2025',
            diameter: 150, // meters
            velocity: 15, // km/s
            mass: 0, // calculated from diameter and density
            density: 3000, // kg/m³ (rocky)
            composition: 'Rocky/Iron'
        };
        
        // UI elements
        this.techniqueSelect = null;
        this.techniqueDescription = null;
        this.techniqueParameters = null;
        this.resultsPanel = null;
        
        // Animation state
        this.isAnimating = false;
        this.animationSpeed = 1.0;
        this.earthRotationSpeed = 0.001;
        
        // Performance monitoring
        this.performanceMonitor = {
            frameCount: 0,
            lastTime: 0,
            fps: 60,
            isLowPerformance: false
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Impactor-2025 Mitigation Simulator...');
            
            // Calculate asteroid mass
            const radius = this.impactorData.diameter / 2; // meters
            const volume = (4/3) * Math.PI * Math.pow(radius, 3); // m³
            this.impactorData.mass = volume * this.impactorData.density; // kg
            
            await this.setupThreeJS();
            await this.setupUI();
            await this.createEarth();
            await this.createImpactor2025();
            await this.createTrajectory();
            await this.setupLighting();
            
        this.animate();
        
        // Debug scene contents
        console.log('🔍 Scene contents:', this.scene.children.map(child => child.name || child.type));
        console.log('🌍 Earth object:', this.earth);
        console.log('🪨 Asteroid object:', this.impactor2025);
        console.log('📷 Camera position:', this.camera.position);
        console.log('💡 Lights in scene:', this.scene.children.filter(child => child.isLight).length);
        
        // Test if objects are visible
        if (this.earth) {
            console.log('✅ Earth is visible:', this.earth.visible);
            console.log('✅ Earth position:', this.earth.position);
        }
        if (this.impactor2025) {
            console.log('✅ Asteroid is visible:', this.impactor2025.visible);
            console.log('✅ Asteroid position:', this.impactor2025.position);
        }
        
        this.showMessage('Impactor-2025 Mitigation Simulator ready!', 'success');
        
        // Add a visible test indicator to confirm the script is running
        const testIndicator = document.createElement('div');
        testIndicator.id = 'test-indicator';
        testIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: #00ff00;
            color: #000;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
        `;
        testIndicator.textContent = '✅ Simulator Loaded - 4K Quality Active';
        document.body.appendChild(testIndicator);
        
        // Remove indicator after 5 seconds
        setTimeout(() => {
            if (testIndicator.parentNode) {
                testIndicator.parentNode.removeChild(testIndicator);
            }
        }, 5000);
            
        } catch (error) {
            console.error('Failed to initialize simulator:', error);
            this.showMessage('Failed to initialize simulator', 'error');
        }
    }
    
    async setupThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Add starfield background
        this.createStarfield();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        
        // Create renderer
        const canvas = document.createElement('canvas');
        const container = document.getElementById('impactor-simulator');
        if (!container) {
            console.error('❌ Container not found!');
            return;
        }
        container.appendChild(canvas);
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
            preserveDrawingBuffer: false,
            logarithmicDepthBuffer: true,
            precision: 'highp'
        });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3)); // Higher pixel ratio for 4K quality
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Ultra-high quality rendering settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        this.renderer.physicallyCorrectLights = true;
        this.renderer.gammaFactor = 2.2;
        this.renderer.useLegacyLights = false;
        
        // 4K quality settings
        this.renderer.capabilities.logarithmicDepthBuffer = true;
        this.renderer.sortObjects = true;
        this.renderer.autoClear = true;
        this.renderer.autoClearColor = true;
        this.renderer.autoClearDepth = true;
        this.renderer.autoClearStencil = true;
        
        // Create controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.enableRotate = true;
        this.controls.autoRotate = false;
        
        // Set control limits
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minPolarAngle = 0;
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('✅ Three.js setup complete');
    }
    
    async setupUI() {
        // Get UI elements
        this.techniqueSelect = document.getElementById('mitigationTechnique');
        this.techniqueDescription = document.getElementById('techniqueDescription');
        this.techniqueParameters = document.getElementById('techniqueParameters');
        this.resultsPanel = document.getElementById('resultsPanel');
        
        console.log('🔍 UI Elements found:');
        console.log('  - techniqueSelect:', this.techniqueSelect);
        console.log('  - techniqueDescription:', this.techniqueDescription);
        console.log('  - techniqueParameters:', this.techniqueParameters);
        console.log('  - resultsPanel:', this.resultsPanel);
        
        if (!this.techniqueSelect) {
            console.error('❌ techniqueSelect not found! Looking for: mitigationTechnique');
            return;
        }
        if (!this.techniqueDescription) {
            console.error('❌ techniqueDescription not found! Looking for: techniqueDescription');
            return;
        }
        if (!this.techniqueParameters) {
            console.error('❌ techniqueParameters not found! Looking for: techniqueParameters');
            return;
        }
        if (!this.resultsPanel) {
            console.error('❌ resultsPanel not found! Looking for: resultsPanel');
            return;
        }
        
        // Setup technique selection handler
        this.techniqueSelect.addEventListener('change', (e) => {
            console.log('🔄 Technique changed to:', e.target.value);
            this.onTechniqueChange(e.target.value);
        });
        
        // Setup action buttons
        const applyBtn = document.getElementById('applyMitigation');
        const resetBtn = document.getElementById('resetSimulation');
        const runBtn = document.getElementById('runSimulation');
        
        console.log('🔍 Buttons found:');
        console.log('  - applyBtn:', applyBtn);
        console.log('  - resetBtn:', resetBtn);
        console.log('  - runBtn:', runBtn);
        
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyMitigation());
            console.log('✅ Apply button event listener added');
        } else {
            console.error('❌ Apply button not found! Looking for: applyMitigation');
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSimulation());
            console.log('✅ Reset button event listener added');
        } else {
            console.error('❌ Reset button not found! Looking for: resetSimulation');
        }
        
        if (runBtn) {
            runBtn.addEventListener('click', () => this.runSimulation());
            console.log('✅ Run button event listener added');
        } else {
            console.error('❌ Run button not found! Looking for: runSimulation');
        }
        
        // Initialize with default technique
        this.onTechniqueChange('none');
        
        // Force update description on load
        setTimeout(() => {
            if (this.techniqueSelect && this.techniqueDescription) {
                const currentValue = this.techniqueSelect.value;
                console.log('🔄 Force updating description for:', currentValue);
                this.onTechniqueChange(currentValue);
            }
        }, 100);
        
        console.log('✅ UI setup complete');
    }
    
    async createEarth() {
        // Create ultra-high quality Earth geometry (4K quality)
        const earthGeometry = new THREE.SphereGeometry(1, 256, 128);
        
        // Create realistic Earth material with PBR properties
        const earthMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a9eff, // Ocean blue
            metalness: 0.0,
            roughness: 0.8,
            transparent: false,
            emissive: 0x0a1a2a, // Subtle blue glow
            emissiveIntensity: 0.1,
            envMapIntensity: 1.0,
            normalScale: new THREE.Vector2(1, 1),
            bumpScale: 0.1
        });
        
        // Ensure material is always visible
        earthMaterial.needsUpdate = true;
        
        // Create Earth mesh with enhanced properties
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.name = 'Earth';
        this.earth.userData = { type: 'earth' };
        this.earth.castShadow = true;
        this.earth.receiveShadow = true;
        this.earth.renderOrder = 0;
        this.earth.visible = true;
        this.scene.add(this.earth);
        
        // Ensure Earth is always visible
        console.log('🌍 Earth created and added to scene at position:', this.earth.position);
        console.log('🌍 Earth material:', this.earth.material);
        console.log('🌍 Earth geometry:', this.earth.geometry);
        
        // Add subtle rotation
        this.earth.rotation.y = Math.PI;
        
        // Create ultra-realistic atmosphere
        this.createUltraRealisticAtmosphere();
        
        // Create high-quality cloud layer
        this.createHighQualityCloudLayer();
        
        // Create city lights with realistic distribution
        this.createRealisticCityLights();
        
        console.log('🌍 Ultra-high quality Earth created with 4K materials');
    }
    
    createUltraRealisticAtmosphere() {
        // Create multi-layer atmosphere with 4K quality
        const atmosphereLayers = [
            { radius: 1.02, opacity: 0.3, color: 0x4a9eff, segments: 128 },
            { radius: 1.05, opacity: 0.2, color: 0x6bb6ff, segments: 96 },
            { radius: 1.08, opacity: 0.15, color: 0x8cc8ff, segments: 64 },
            { radius: 1.12, opacity: 0.1, color: 0xa8d8ff, segments: 48 },
            { radius: 1.16, opacity: 0.05, color: 0xc4e8ff, segments: 32 }
        ];
        
        atmosphereLayers.forEach((layer, index) => {
            const atmosphereGeometry = new THREE.SphereGeometry(layer.radius, layer.segments, layer.segments / 2);
            const atmosphereMaterial = new THREE.MeshStandardMaterial({
                color: layer.color,
                transparent: true,
                opacity: layer.opacity,
                side: THREE.BackSide,
                metalness: 0.0,
                roughness: 0.1,
                emissive: layer.color,
                emissiveIntensity: 0.1
            });
            
            const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            atmosphere.name = `AtmosphereLayer${index}`;
            atmosphere.castShadow = false;
            atmosphere.receiveShadow = false;
            this.scene.add(atmosphere);
        });
        
        // Create atmospheric scattering effect
        this.createAtmosphericScattering();
    }
    
    createAtmosphericScattering() {
        // Create volumetric atmospheric scattering
        const scatteringGeometry = new THREE.SphereGeometry(1.2, 64, 32);
        const scatteringMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.02,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const scattering = new THREE.Mesh(scatteringGeometry, scatteringMaterial);
        scattering.name = 'AtmosphericScattering';
        this.scene.add(scattering);
    }
    
    createHighQualityCloudLayer() {
        // Create multiple cloud layers for realism
        const cloudLayers = [
            { radius: 1.015, opacity: 0.4, color: 0xffffff, segments: 128 },
            { radius: 1.02, opacity: 0.3, color: 0xf8f8f8, segments: 96 },
            { radius: 1.025, opacity: 0.2, color: 0xf0f0f0, segments: 64 }
        ];
        
        cloudLayers.forEach((layer, index) => {
            const cloudGeometry = new THREE.SphereGeometry(layer.radius, layer.segments, layer.segments / 2);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                color: layer.color,
                transparent: true,
                opacity: layer.opacity,
                metalness: 0.0,
                roughness: 0.9,
                emissive: layer.color,
                emissiveIntensity: 0.1
            });
            
            const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
            clouds.name = `CloudLayer${index}`;
            clouds.castShadow = true;
            clouds.receiveShadow = true;
            this.scene.add(clouds);
        });
        
        // Create cloud particles for extra realism
        this.createCloudParticles();
    }
    
    createCloudParticles() {
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Distribute particles on sphere surface
            const radius = 1.02 + Math.random() * 0.03;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            colors[i * 3] = 1.0; // White
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;
            
            sizes[i] = Math.random() * 0.05 + 0.02;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            alphaTest: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const cloudParticles = new THREE.Points(particles, particleMaterial);
        cloudParticles.name = 'CloudParticles';
        this.scene.add(cloudParticles);
    }
    
    createRealisticCityLights() {
        // Create city lights with realistic distribution
        const cityLightsGeometry = new THREE.SphereGeometry(1.01, 128, 64);
        const cityLightsMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
            metalness: 0.0,
            roughness: 0.1,
            emissive: 0xffffaa,
            emissiveIntensity: 0.5
        });
        
        const cityLights = new THREE.Mesh(cityLightsGeometry, cityLightsMaterial);
        cityLights.name = 'CityLights';
        cityLights.castShadow = false;
        cityLights.receiveShadow = false;
        this.scene.add(cityLights);
        
        // Create individual city light points
        this.createCityLightPoints();
    }
    
    createCityLightPoints() {
        const lightCount = 100;
        const lights = new THREE.BufferGeometry();
        const positions = new Float32Array(lightCount * 3);
        const colors = new Float32Array(lightCount * 3);
        
        for (let i = 0; i < lightCount; i++) {
            // Distribute lights on night side of Earth
            const radius = 1.01;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Vary light colors (white, yellow, orange)
            const lightType = Math.random();
            if (lightType < 0.6) {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.8; // White
            } else if (lightType < 0.8) {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.4; // Yellow
            } else {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.6; colors[i * 3 + 2] = 0.2; // Orange
            }
        }
        
        lights.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        lights.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const lightMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            alphaTest: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const cityLightPoints = new THREE.Points(lights, lightMaterial);
        cityLightPoints.name = 'CityLightPoints';
        this.scene.add(cityLightPoints);
    }
    
    async createImpactor2025() {
        // Create ultra-high quality irregular asteroid geometry
        const asteroidGeometry = new THREE.IcosahedronGeometry(0.1, 4);
        
        // Add detailed noise to vertices for ultra-realistic irregular shape
        const vertices = asteroidGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            // Multi-octave noise for realistic surface
            const noise1 = (Math.random() - 0.5) * 0.05;
            const noise2 = (Math.random() - 0.5) * 0.03;
            const noise3 = (Math.random() - 0.5) * 0.02;
            
            vertices[i] += noise1 + noise2 + noise3;
            vertices[i + 1] += noise1 + noise2 + noise3;
            vertices[i + 2] += noise1 + noise2 + noise3;
        }
        asteroidGeometry.attributes.position.needsUpdate = true;
        asteroidGeometry.computeVertexNormals();
        
        // Create ultra-realistic asteroid material with PBR properties
        const asteroidMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            metalness: 0.1,
            roughness: 0.9,
            transparent: false,
            emissive: 0x2a2a2a,
            emissiveIntensity: 0.05,
            normalScale: new THREE.Vector2(1, 1),
            bumpScale: 0.2
        });
        
        // Create asteroid mesh with enhanced properties
        this.impactor2025 = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        this.impactor2025.name = 'Impactor-2025';
        this.impactor2025.userData = { 
            type: 'asteroid',
            data: this.impactorData
        };
        this.impactor2025.castShadow = true;
        this.impactor2025.receiveShadow = true;
        this.impactor2025.renderOrder = 1;
        this.impactor2025.visible = true;
        
        // Position asteroid far from Earth
        this.impactor2025.position.set(6, 0, 0);
        this.scene.add(this.impactor2025);
        
        // Ensure asteroid is always visible
        console.log('🪨 Asteroid created and added to scene at position:', this.impactor2025.position);
        
        // Create asteroid dust trail
        this.createAsteroidDustTrail();
        
        console.log('🪨 Ultra-high quality Impactor-2025 created with dust trail');
    }
    
    createAsteroidDustTrail() {
        const dustCount = 50;
        const dustGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dustCount * 3);
        const colors = new Float32Array(dustCount * 3);
        
        for (let i = 0; i < dustCount; i++) {
            // Create dust trail behind asteroid
            const distance = -0.2 - Math.random() * 0.5;
            const spread = (Math.random() - 0.5) * 0.1;
            
            positions[i * 3] = this.impactor2025.position.x + distance;
            positions[i * 3 + 1] = this.impactor2025.position.y + spread;
            positions[i * 3 + 2] = this.impactor2025.position.z + spread;
            
            colors[i * 3] = 0.8; // Dust color
            colors[i * 3 + 1] = 0.7;
            colors[i * 3 + 2] = 0.6;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            size: 0.01,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            alphaTest: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const dustTrail = new THREE.Points(dustGeometry, dustMaterial);
        dustTrail.name = 'AsteroidDustTrail';
        this.scene.add(dustTrail);
    }
    
    async createTrajectory() {
        // Create trajectory curve
        const points = [
            new THREE.Vector3(6, 0, 0),  // Start position
            new THREE.Vector3(3, 0.5, 0), // Mid point
            new THREE.Vector3(0, 0, 0)   // Earth position
        ];
        
        this.originalTrajectory = new THREE.CatmullRomCurve3(points);
        
        // Create trajectory geometry
        const trajectoryGeometry = new THREE.TubeGeometry(this.originalTrajectory, 64, 0.01, 8, false);
        const trajectoryMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a9eff,
            transparent: true,
            opacity: 0.8
        });
        
        this.trajectory = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
        this.trajectory.name = 'Trajectory';
        this.scene.add(this.trajectory);
        
        // Create trajectory arrows
        this.createTrajectoryArrows();
        
        console.log('🚀 Trajectory created and added to scene');
    }
    
    createTrajectoryArrows() {
        // Clear existing arrows
        this.trajectoryArrows.forEach(arrow => this.scene.remove(arrow));
        this.trajectoryArrows = [];
        
        // Create arrows along trajectory
        const numArrows = 5;
        for (let i = 0; i < numArrows; i++) {
            const t = i / (numArrows - 1);
            const point = this.originalTrajectory.getPoint(t);
            const tangent = this.originalTrajectory.getTangent(t);
            
            const arrow = new THREE.ArrowHelper(
                tangent,
                point,
                0.2,
                0x4a9eff,
                0.1,
                0.05
            );
            
            this.trajectoryArrows.push(arrow);
            this.scene.add(arrow);
        }
    }
    
    async setupLighting() {
        // Ultra-realistic lighting system for 4K quality
        
        // Ambient light - subtle global illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Main sun light - ultra-high quality directional lighting
        const sunLight = new THREE.DirectionalLight(0xffffff, 3.0);
        sunLight.position.set(15, 10, 8);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 8192; // 8K shadow maps
        sunLight.shadow.mapSize.height = 8192;
        sunLight.shadow.camera.near = 0.1;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.camera.left = -20;
        sunLight.shadow.camera.right = 20;
        sunLight.shadow.camera.top = 20;
        sunLight.shadow.camera.bottom = -20;
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.normalBias = 0.02;
        sunLight.shadow.radius = 4;
        this.scene.add(sunLight);
        
        // Secondary sun light for realistic lighting
        const sunLight2 = new THREE.DirectionalLight(0xfff8dc, 1.5);
        sunLight2.position.set(-8, 5, -3);
        sunLight2.castShadow = true;
        sunLight2.shadow.mapSize.width = 4096;
        sunLight2.shadow.mapSize.height = 4096;
        this.scene.add(sunLight2);
        
        // Earth fill light - blue atmospheric lighting
        const earthFillLight = new THREE.DirectionalLight(0x4a9eff, 1.2);
        earthFillLight.position.set(-10, 5, -8);
        earthFillLight.castShadow = true;
        this.scene.add(earthFillLight);
        
        // Rim light for Earth edge definition
        const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
        rimLight.position.set(0, 0, -12);
        this.scene.add(rimLight);
        
        // Asteroid lighting - warm point light
        const asteroidLight = new THREE.PointLight(0xffaa00, 1.5, 20);
        asteroidLight.position.copy(this.impactor2025.position);
        asteroidLight.castShadow = true;
        asteroidLight.shadow.mapSize.width = 2048;
        asteroidLight.shadow.mapSize.height = 2048;
        this.scene.add(asteroidLight);
        
        // Space environment lighting
        const spaceLight = new THREE.HemisphereLight(0x87ceeb, 0x000011, 0.3);
        this.scene.add(spaceLight);
        
        // Enhanced shadow settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        
        console.log('💡 Ultra-realistic 4K lighting setup complete');
    }
    
    createStarfield() {
        // Create ultra-realistic 4K starfield
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 5000; // Increased for 4K quality
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            // Distribute stars on sphere surface for realistic distribution
            const radius = 1000 + Math.random() * 1000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Vary star colors (white, blue, yellow, red)
            const starType = Math.random();
            if (starType < 0.7) {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0; // White
            } else if (starType < 0.85) {
                colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 1.0; // Blue
            } else if (starType < 0.95) {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.8; // Yellow
            } else {
                colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.6; // Red
            }
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            alphaTest: 0.1,
            blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        stars.name = 'Starfield';
        this.scene.add(stars);
        
        // Create nebula background
        this.createNebulaBackground();
        
        console.log('⭐ Ultra-realistic 4K starfield created');
    }
    
    createNebulaBackground() {
        // Create distant nebula for depth
        const nebulaGeometry = new THREE.SphereGeometry(2000, 32, 16);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1a3a,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        nebula.name = 'Nebula';
        this.scene.add(nebula);
    }
    
    onTechniqueChange(technique) {
        this.currentTechnique = technique;
        
        // Update description
        const descriptions = {
            'none': '<strong>None / Observe:</strong> Baseline trajectory and risk.',
            'kinetic': '<strong>Kinetic Impactor:</strong> Instant push from a high-speed interceptor (DART-style). Best with months+ lead time.',
            'gravity': '<strong>Gravity Tractor:</strong> Slow pull from a nearby spacecraft. Needs long lead time.',
            'nuclear': '<strong>Nuclear Standoff:</strong> Strong impulse from a near-surface detonation (no contact).',
            'laser': '<strong>Laser / Solar Ablation:</strong> Gentle continuous thrust by heating one side.',
            'albedo': '<strong>Albedo / Yarkovsky Boost:</strong> Tiny long-term drift via surface reflectivity change.'
        };
        
        if (this.techniqueDescription) {
            const description = descriptions[technique] || descriptions['none'];
            this.techniqueDescription.innerHTML = `<p>${description}</p>`;
            console.log(`🔄 Updated description for technique: ${technique}`);
        }
        
        // Show/hide parameters
        if (technique === 'none') {
            if (this.techniqueParameters) {
                this.techniqueParameters.style.display = 'none';
            }
        } else {
            if (this.techniqueParameters) {
                this.techniqueParameters.style.display = 'block';
                this.createTechniqueParameters(technique);
            }
        }
    }
    
    createTechniqueParameters(technique) {
        let parametersHTML = '';
        
        switch (technique) {
            case 'kinetic':
                parametersHTML = `
                    <div class="parameter-group">
                        <label>Interceptor Mass (kg):</label>
                        <input type="number" id="interceptorMass" value="500" min="100" max="2000" step="100">
                    </div>
                    <div class="parameter-group">
                        <label>Relative Speed (km/s):</label>
                        <input type="number" id="relativeSpeed" value="6" min="1" max="15" step="0.5">
                    </div>
                    <div class="parameter-group">
                        <label>Lead Time (months):</label>
                        <select id="leadTime">
                            <option value="6">6 months</option>
                            <option value="12" selected>12 months</option>
                            <option value="24">24 months</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'gravity':
                parametersHTML = `
                    <div class="parameter-group">
                        <label>Tractor Mass (kg):</label>
                        <input type="number" id="tractorMass" value="1000" min="500" max="5000" step="100">
                    </div>
                    <div class="parameter-group">
                        <label>Hover Distance (m):</label>
                        <input type="number" id="hoverDistance" value="50" min="10" max="200" step="10">
                    </div>
                    <div class="parameter-group">
                        <label>Duration (months):</label>
                        <select id="duration">
                            <option value="12">12 months</option>
                            <option value="24" selected>24 months</option>
                            <option value="36">36 months</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'nuclear':
                parametersHTML = `
                    <div class="parameter-group">
                        <label>Yield Level:</label>
                        <select id="yieldLevel">
                            <option value="low">Low (1 kt)</option>
                            <option value="medium" selected>Medium (10 kt)</option>
                            <option value="high">High (100 kt)</option>
                        </select>
                    </div>
                    <div class="parameter-group">
                        <label>Standoff Distance (m):</label>
                        <input type="number" id="standoffDistance" value="100" min="50" max="500" step="25">
                    </div>
                    <div class="parameter-group">
                        <label>Lead Time (months):</label>
                        <select id="nuclearLeadTime">
                            <option value="3">3 months</option>
                            <option value="6" selected>6 months</option>
                            <option value="12">12 months</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'laser':
                parametersHTML = `
                    <div class="parameter-group">
                        <label>Power Level (MW):</label>
                        <select id="powerLevel">
                            <option value="1">1 MW</option>
                            <option value="10" selected>10 MW</option>
                            <option value="100">100 MW</option>
                        </select>
                    </div>
                    <div class="parameter-group">
                        <label>Active Duration (days):</label>
                        <input type="number" id="activeDays" value="365" min="30" max="1000" step="30">
                    </div>
                    <div class="parameter-group">
                        <label>Distance (km):</label>
                        <input type="number" id="laserDistance" value="1000" min="100" max="10000" step="100">
                    </div>
                `;
                break;
                
            case 'albedo':
                parametersHTML = `
                    <div class="parameter-group">
                        <label>Coverage (%):</label>
                        <input type="number" id="coverage" value="50" min="10" max="100" step="10">
                    </div>
                    <div class="parameter-group">
                        <label>Effect Duration (years):</label>
                        <select id="effectDuration">
                            <option value="1">1 year</option>
                            <option value="2" selected>2 years</option>
                            <option value="5">5 years</option>
                        </select>
                    </div>
                    <div class="parameter-group">
                        <label>Lead Time (years):</label>
                        <select id="albedoLeadTime">
                            <option value="1">1 year</option>
                            <option value="2" selected>2 years</option>
                            <option value="3">3 years</option>
                        </select>
                    </div>
                `;
                break;
        }
        
        if (this.techniqueParameters) {
            this.techniqueParameters.innerHTML = parametersHTML;
        }
    }
    
    applyMitigation() {
        if (this.currentTechnique === 'none') {
            this.showMessage('No mitigation technique selected', 'info');
            return;
        }
        
        console.log(`🛡️ Applying ${this.currentTechnique} mitigation technique...`);
        
        // Calculate delta-v based on technique
        const deltaV = this.calculateDeltaV(this.currentTechnique);
        
        // Apply delta-v to asteroid velocity
        this.applyDeltaV(deltaV);
        
        // Create 3D visual effects for each technique
        this.createMitigationVisualEffects(this.currentTechnique);
        
        // Update trajectory
        this.updateTrajectory();
        
        // Update results
        this.updateResults();
        
        this.mitigationApplied = true;
        this.showMessage(`${this.currentTechnique} mitigation applied successfully!`, 'success');
    }
    
    calculateDeltaV(technique) {
        const deltaV = { magnitude: 0, direction: new THREE.Vector3(1, 0, 0) };
        
        switch (technique) {
            case 'kinetic':
                const interceptorMass = parseFloat(document.getElementById('interceptorMass')?.value || 500);
                const relativeSpeed = parseFloat(document.getElementById('relativeSpeed')?.value || 6);
                const leadTime = parseFloat(document.getElementById('leadTime')?.value || 12);
                
                // Kinetic impactor delta-v calculation (momentum transfer)
                const momentumTransfer = interceptorMass * relativeSpeed * 1000; // kg⋅m/s
                deltaV.magnitude = momentumTransfer / this.impactorData.mass; // m/s
                const leadTimeEffectiveness = Math.max(0.1, 12 / leadTime);
                deltaV.magnitude *= leadTimeEffectiveness;
                deltaV.magnitude *= (0.8 + Math.random() * 0.4);
                break;
                
            case 'gravity':
                const tractorMass = parseFloat(document.getElementById('tractorMass')?.value || 1000);
                const hoverDistance = parseFloat(document.getElementById('hoverDistance')?.value || 50);
                const duration = parseFloat(document.getElementById('duration')?.value || 24);
                
                const G = 6.674e-11; // Gravitational constant
                const force = (G * tractorMass * this.impactorData.mass) / Math.pow(hoverDistance, 2);
                const gravityAcceleration = force / this.impactorData.mass;
                const gravityTime = duration * 30 * 24 * 3600; // Convert months to seconds
                deltaV.magnitude = gravityAcceleration * gravityTime * 0.1; // Scale down for realism
                break;
                
            case 'nuclear':
                const yieldLevel = document.getElementById('yieldLevel')?.value || 'medium';
                const standoffDistance = parseFloat(document.getElementById('standoffDistance')?.value || 100);
                const nuclearLeadTime = parseFloat(document.getElementById('nuclearLeadTime')?.value || 6);
                
                let yieldValue = 0;
                switch (yieldLevel) {
                    case 'low': yieldValue = 4.184e12; break; // 1 kt in Joules
                    case 'medium': yieldValue = 4.184e13; break; // 10 kt
                    case 'high': yieldValue = 4.184e14; break; // 100 kt
                }
                
                const efficiency = Math.exp(-standoffDistance / 100); // Exponential decay
                const energyTransfer = yieldValue * efficiency;
                deltaV.magnitude = Math.sqrt(2 * energyTransfer / this.impactorData.mass);
                deltaV.magnitude *= Math.max(0.1, 6 / nuclearLeadTime);
                break;
                
            case 'laser':
                const powerLevel = parseFloat(document.getElementById('powerLevel')?.value || 10);
                const activeDays = parseFloat(document.getElementById('activeDays')?.value || 365);
                const laserDistance = parseFloat(document.getElementById('laserDistance')?.value || 1000);
                
                const totalEnergy = powerLevel * 1e6 * activeDays * 24 * 3600; // Joules
                const energyDensity = totalEnergy / (4 * Math.PI * Math.pow(laserDistance * 1000, 2)); // J/m²
                const ablationRate = energyDensity / (2.5e6); // kg/m² (vaporization energy)
                const laserSurfaceArea = 4 * Math.PI * Math.pow(this.impactorData.diameter / 2, 2); // m²
                const totalAblation = ablationRate * laserSurfaceArea; // kg
                const exhaustVelocity = 1000; // m/s (typical for laser ablation)
                deltaV.magnitude = (totalAblation * exhaustVelocity) / this.impactorData.mass;
                break;
                
            case 'albedo':
                const coverage = parseFloat(document.getElementById('coverage')?.value || 50);
                const effectDuration = parseFloat(document.getElementById('effectDuration')?.value || 2);
                const albedoLeadTime = parseFloat(document.getElementById('albedoLeadTime')?.value || 2);
                
                const solarConstant = 1361; // W/m²
                const asteroidRadius = this.impactorData.diameter / 2;
                const albedoSurfaceArea = 4 * Math.PI * Math.pow(asteroidRadius, 2);
                const albedoChange = (coverage / 100) * 0.1; // 10% max albedo change
                const thermalForce = solarConstant * albedoSurfaceArea * albedoChange / (3e8); // N
                const acceleration = thermalForce / this.impactorData.mass;
                const totalTime = effectDuration * 365 * 24 * 3600; // years to seconds
                deltaV.magnitude = acceleration * totalTime * 0.01; // Very small effect
                break;
        }
        
        // Ensure minimum delta-v for visibility
        deltaV.magnitude = Math.max(deltaV.magnitude, 0.001);
        
        return deltaV;
    }
    
    createMitigationVisualEffects(technique) {
        console.log(`🎬 Creating 3D visual effects for ${technique}...`);
        
        // Clean up any existing effects first
        this.cleanupMitigationEffects();
        
        switch (technique) {
            case 'kinetic':
                this.createKineticImpactorEffects();
                break;
            case 'gravity':
                this.createGravityTractorEffects();
                break;
            case 'nuclear':
                this.createNuclearStandoffEffects();
                break;
            case 'laser':
                this.createLaserAblationEffects();
                break;
            case 'albedo':
                this.createAlbedoModificationEffects();
                break;
        }
    }
    
    cleanupMitigationEffects() {
        console.log('🧹 Cleaning up previous mitigation effects...');
        
        const effectNames = [
            'Interceptor', 'ThrusterParticles', 'ImpactExplosion',
            'GravityTractor', 'GravitationalField',
            'NuclearDevice', 'CountdownTimer', 'NuclearExplosion',
            'LaserBeam', 'LaserBeamLine', 'AsteroidHeating',
            'PaintSprayer', 'PaintParticles'
        ];
        
        effectNames.forEach(name => {
            const obj = this.scene.getObjectByName(name);
            if (obj) {
                this.scene.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            }
        });
    }
    
    createKineticImpactorEffects() {
        console.log('🚀 Creating Kinetic Impactor 3D effects...');
        
        // Create interceptor spacecraft
        const interceptorGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.1);
        const interceptorMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x444444,
            shininess: 100
        });
        
        const interceptor = new THREE.Mesh(interceptorGeometry, interceptorMaterial);
        interceptor.name = 'Interceptor';
        interceptor.position.set(8, 0, 0);
        this.scene.add(interceptor);
        
        // Create thruster particles
        this.createThrusterParticles(interceptor);
        
        // Animate interceptor approach
        this.animateInterceptorApproach(interceptor);
        
        // Create impact explosion
        setTimeout(() => {
            this.createImpactExplosion();
        }, 2000);
    }
    
    createThrusterParticles(interceptor) {
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = interceptor.position.x - 0.1;
            positions[i * 3 + 1] = interceptor.position.y + (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 2] = interceptor.position.z + (Math.random() - 0.5) * 0.1;
            
            colors[i * 3] = 1.0; // Red
            colors[i * 3 + 1] = 0.5; // Green
            colors[i * 3 + 2] = 0.0; // Blue
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            alphaTest: 0.1
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        particleSystem.name = 'ThrusterParticles';
        this.scene.add(particleSystem);
    }
    
    animateInterceptorApproach(interceptor) {
        const startPos = interceptor.position.clone();
        const targetPos = this.impactor2025.position.clone();
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            interceptor.position.lerpVectors(startPos, targetPos, progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove interceptor after impact
                this.scene.remove(interceptor);
            }
        };
        
        animate();
    }
    
    createImpactExplosion() {
        const explosionGeometry = new THREE.SphereGeometry(0.2, 16, 8);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.8
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(this.impactor2025.position);
        explosion.name = 'ImpactExplosion';
        this.scene.add(explosion);
        
        // Animate explosion
        this.animateExplosion(explosion);
    }
    
    animateExplosion(explosion) {
        const startScale = 0.1;
        const endScale = 2.0;
        const duration = 1000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scale = startScale + (endScale - startScale) * progress;
            const opacity = 1.0 - progress;
            
            explosion.scale.setScalar(scale);
            explosion.material.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(explosion);
            }
        };
        
        animate();
    }
    
    createGravityTractorEffects() {
        console.log('🛸 Creating Gravity Tractor 3D effects...');
        
        // Create tractor spacecraft
        const tractorGeometry = new THREE.ConeGeometry(0.03, 0.1, 8);
        const tractorMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff88,
            emissive: 0x004422,
            shininess: 50
        });
        
        const tractor = new THREE.Mesh(tractorGeometry, tractorMaterial);
        tractor.name = 'GravityTractor';
        tractor.position.set(0.2, 0, 0); // Near asteroid
        this.scene.add(tractor);
        
        // Create gravitational field visualization
        this.createGravitationalField(tractor);
        
        // Animate tractor hovering
        this.animateTractorHovering(tractor);
    }
    
    createGravitationalField(tractor) {
        const fieldGeometry = new THREE.SphereGeometry(0.5, 16, 8);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.name = 'GravitationalField';
        field.position.copy(tractor.position);
        this.scene.add(field);
        
        // Animate field pulsing
        this.animateFieldPulsing(field);
    }
    
    animateTractorHovering(tractor) {
        const startPos = tractor.position.clone();
        const hoverDistance = 0.2;
        
        const animate = () => {
            const time = Date.now() * 0.001;
            tractor.position.y = startPos.y + Math.sin(time * 2) * 0.05;
            tractor.position.z = startPos.z + Math.cos(time * 1.5) * 0.03;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    animateFieldPulsing(field) {
        const animate = () => {
            const time = Date.now() * 0.002;
            const scale = 1 + Math.sin(time) * 0.2;
            field.scale.setScalar(scale);
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createNuclearStandoffEffects() {
        console.log('💥 Creating Nuclear Standoff 3D effects...');
        
        // Create nuclear device
        const nukeGeometry = new THREE.SphereGeometry(0.05, 16, 8);
        const nukeMaterial = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            emissive: 0x440000,
            shininess: 100
        });
        
        const nuke = new THREE.Mesh(nukeGeometry, nukeMaterial);
        nuke.name = 'NuclearDevice';
        nuke.position.set(0.3, 0, 0); // Near asteroid
        this.scene.add(nuke);
        
        // Create countdown timer
        this.createCountdownTimer();
        
        // Animate nuclear detonation
        setTimeout(() => {
            this.animateNuclearDetonation(nuke);
        }, 3000);
    }
    
    createCountdownTimer() {
        const timerGeometry = new THREE.RingGeometry(0.1, 0.15, 16);
        const timerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        const timer = new THREE.Mesh(timerGeometry, timerMaterial);
        timer.name = 'CountdownTimer';
        timer.position.set(0.3, 0.2, 0);
        this.scene.add(timer);
        
        // Animate countdown
        this.animateCountdown(timer);
    }
    
    animateCountdown(timer) {
        const duration = 3000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const rotation = progress * Math.PI * 2;
            
            timer.rotation.z = rotation;
            timer.material.opacity = 1.0 - progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(timer);
            }
        };
        
        animate();
    }
    
    animateNuclearDetonation(nuke) {
        // Create massive explosion
        const explosionGeometry = new THREE.SphereGeometry(0.1, 32, 16);
        const explosionMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 1.0
        });
        
        const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
        explosion.position.copy(nuke.position);
        explosion.name = 'NuclearExplosion';
        this.scene.add(explosion);
        
        // Remove nuke
        this.scene.remove(nuke);
        
        // Animate explosion
        const startScale = 0.1;
        const endScale = 5.0;
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const scale = startScale + (endScale - startScale) * progress;
            const opacity = 1.0 - progress;
            
            explosion.scale.setScalar(scale);
            explosion.material.opacity = opacity;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(explosion);
            }
        };
        
        animate();
    }
    
    createLaserAblationEffects() {
        console.log('🔴 Creating Laser Ablation 3D effects...');
        
        // Create laser source
        const laserGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 8);
        const laserMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.name = 'LaserBeam';
        laser.position.set(2, 0, 0);
        laser.rotation.z = Math.PI / 2;
        this.scene.add(laser);
        
        // Create laser beam
        this.createLaserBeam(laser);
        
        // Animate laser heating
        this.animateLaserHeating();
    }
    
    createLaserBeam(laser) {
        const beamGeometry = new THREE.CylinderGeometry(0.005, 0.005, 2, 8);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            transparent: true,
            opacity: 0.6
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.name = 'LaserBeamLine';
        beam.position.set(1, 0, 0);
        beam.rotation.z = Math.PI / 2;
        this.scene.add(beam);
        
        // Animate beam
        this.animateLaserBeam(beam);
    }
    
    animateLaserBeam(beam) {
        const animate = () => {
            const time = Date.now() * 0.01;
            beam.material.opacity = 0.3 + Math.sin(time) * 0.3;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    animateLaserHeating() {
        // Create heating effect on asteroid
        const heatingGeometry = new THREE.SphereGeometry(0.12, 16, 8);
        const heatingMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.3
        });
        
        const heating = new THREE.Mesh(heatingGeometry, heatingMaterial);
        heating.name = 'AsteroidHeating';
        heating.position.copy(this.impactor2025.position);
        this.scene.add(heating);
        
        // Animate heating
        const animate = () => {
            const time = Date.now() * 0.005;
            heating.material.opacity = 0.1 + Math.sin(time) * 0.2;
            heating.rotation.y += 0.01;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createAlbedoModificationEffects() {
        console.log('🎨 Creating Albedo Modification 3D effects...');
        
        // Create paint sprayer
        const sprayerGeometry = new THREE.ConeGeometry(0.02, 0.1, 8);
        const sprayerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0x444444,
            shininess: 100
        });
        
        const sprayer = new THREE.Mesh(sprayerGeometry, sprayerMaterial);
        sprayer.name = 'PaintSprayer';
        sprayer.position.set(0.2, 0, 0);
        this.scene.add(sprayer);
        
        // Create paint particles
        this.createPaintParticles(sprayer);
        
        // Animate paint application
        this.animatePaintApplication(sprayer);
    }
    
    createPaintParticles(sprayer) {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = sprayer.position.x + (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 1] = sprayer.position.y + (Math.random() - 0.5) * 0.1;
            positions[i * 3 + 2] = sprayer.position.z + (Math.random() - 0.5) * 0.1;
            
            colors[i * 3] = 1.0; // White paint
            colors[i * 3 + 1] = 1.0;
            colors[i * 3 + 2] = 1.0;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.01,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            alphaTest: 0.1
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        particleSystem.name = 'PaintParticles';
        this.scene.add(particleSystem);
    }
    
    animatePaintApplication(sprayer) {
        const startPos = sprayer.position.clone();
        const duration = 5000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Move sprayer around asteroid
            const angle = progress * Math.PI * 4;
            sprayer.position.x = startPos.x + Math.cos(angle) * 0.1;
            sprayer.position.y = startPos.y + Math.sin(angle) * 0.05;
            sprayer.position.z = startPos.z + Math.sin(angle * 2) * 0.03;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Remove sprayer after painting
                this.scene.remove(sprayer);
            }
        };
        
        animate();
    }
    
    applyDeltaV(deltaV) {
        // Store original position for reset
        if (!this.originalPosition) {
            this.originalPosition = this.impactor2025.position.clone();
        }
        
        // Store delta-v for results display
        this.lastDeltaV = deltaV;
        
        // Apply delta-v to asteroid position (simplified orbital mechanics)
        const velocityChange = deltaV.direction.clone().multiplyScalar(deltaV.magnitude * 0.1);
        
        // Apply the change to asteroid position
        this.impactor2025.position.add(velocityChange);
        
        // Add some orbital mechanics - the asteroid should curve toward Earth
        const earthPos = new THREE.Vector3(0, 0, 0);
        const directionToEarth = earthPos.clone().sub(this.impactor2025.position).normalize();
        const gravityEffect = directionToEarth.multiplyScalar(0.05);
        this.impactor2025.position.add(gravityEffect);
        
        console.log(`🚀 Applied delta-v: ${deltaV.magnitude.toFixed(6)} m/s`);
    }
    
    updateTrajectory() {
        // Create new trajectory with mitigation applied
        const currentPos = this.impactor2025.position.clone();
        
        // Calculate deflection angle based on delta-v magnitude
        const deflectionAngle = Math.atan2(currentPos.y, currentPos.x);
        const deflectionMagnitude = Math.sqrt(currentPos.x * currentPos.x + currentPos.y * currentPos.y);
        
        // Create more realistic trajectory with orbital mechanics
        const newPoints = [];
        const numPoints = 20;
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const x = 6 - (6 * t) + (deflectionMagnitude * Math.sin(deflectionAngle) * t * 0.5);
            const y = deflectionMagnitude * Math.sin(deflectionAngle) * t * 0.3;
            const z = Math.sin(t * Math.PI) * 0.2; // Slight orbital curve
            
            newPoints.push(new THREE.Vector3(x, y, z));
        }
        
        this.modifiedTrajectory = new THREE.CatmullRomCurve3(newPoints);
        
        // Update trajectory geometry
        if (this.trajectory) {
            this.scene.remove(this.trajectory);
        }
        
        const trajectoryGeometry = new THREE.TubeGeometry(this.modifiedTrajectory, 64, 0.01, 8, false);
        
        // Color based on deflection success
        const deflectionSuccess = this.calculateDeflectionSuccess();
        let trajectoryColor = 0x4a9eff; // Blue for original
        if (deflectionSuccess > 0.7) {
            trajectoryColor = 0x00ff00; // Green for success
        } else if (deflectionSuccess > 0.3) {
            trajectoryColor = 0xffaa00; // Orange for partial
        } else {
            trajectoryColor = 0xff4444; // Red for failure
        }
        
        const trajectoryMaterial = new THREE.MeshBasicMaterial({
            color: trajectoryColor,
            transparent: true,
            opacity: 0.8
        });
        
        this.trajectory = new THREE.Mesh(trajectoryGeometry, trajectoryMaterial);
        this.trajectory.name = 'ModifiedTrajectory';
        this.scene.add(this.trajectory);
        
        // Update trajectory arrows
        this.createTrajectoryArrows();
    }
    
    calculateDeflectionSuccess() {
        // Calculate how successful the deflection is
        const currentPos = this.impactor2025.position;
        const earthPos = new THREE.Vector3(0, 0, 0);
        const distance = currentPos.distanceTo(earthPos);
        const earthRadius = 1.1; // Slightly larger than Earth for impact detection
        
        if (distance < earthRadius) {
            return 0; // Impact
        } else if (distance < earthRadius * 1.5) {
            return 0.3; // Close call
        } else if (distance < earthRadius * 2) {
            return 0.7; // Partial deflection
        } else {
            return 1.0; // Full deflection
        }
    }
    
    updateResults() {
        // Calculate comprehensive results
        const impactProbability = this.calculateImpactProbability();
        const impactEnergy = this.calculateImpactEnergy();
        const craterDiameter = this.calculateCraterDiameter(impactEnergy);
        const deflectionSuccess = this.calculateDeflectionSuccess();
        const missDistance = this.calculateMissDistance();
        const deltaVApplied = this.calculateCurrentDeltaV();
        
        // Determine result status
        let statusIcon = '🎯';
        let statusText = 'Analysis Complete';
        let statusColor = '#4a9eff';
        
        if (deflectionSuccess > 0.8) {
            statusIcon = '✅';
            statusText = 'Deflection Successful';
            statusColor = '#27ae60';
        } else if (deflectionSuccess > 0.4) {
            statusIcon = '⚠️';
            statusText = 'Partial Deflection';
            statusColor = '#f39c12';
        } else if (impactProbability > 50) {
            statusIcon = '💥';
            statusText = 'Impact Likely';
            statusColor = '#e74c3c';
        }
        
        // Update results panel with comprehensive data
        const resultsHTML = `
            <div class="result-card">
                <h4>${statusIcon} Mitigation Analysis</h4>
                <p><strong>Status:</strong> <span style="color: ${statusColor}">${statusText}</span></p>
                <p><strong>Technique:</strong> ${this.getTechniqueDisplayName(this.currentTechnique)}</p>
                <p><strong>Delta-V Applied:</strong> ${deltaVApplied.toFixed(3)} m/s</p>
                <hr style="margin: 10px 0; border: 1px solid #333;">
                <p><strong>Impact Probability:</strong> ${impactProbability}%</p>
                <p><strong>Miss Distance:</strong> ${missDistance.toFixed(2)} Earth radii</p>
                <p><strong>Deflection Success:</strong> ${(deflectionSuccess * 100).toFixed(1)}%</p>
                <hr style="margin: 10px 0; border: 1px solid #333;">
                <p><strong>Impact Energy:</strong> ${impactEnergy.toFixed(2)} TNT equivalent</p>
                <p><strong>Crater Diameter:</strong> ${craterDiameter.toFixed(1)} km</p>
                <p><strong>Seismic Magnitude:</strong> ${this.calculateSeismicMagnitude(impactEnergy)}</p>
            </div>
        `;
        
        if (this.resultsPanel) {
            this.resultsPanel.innerHTML = resultsHTML;
        }
    }
    
    getTechniqueDisplayName(technique) {
        const names = {
            'none': 'None / Observe',
            'kinetic': 'Kinetic Impactor',
            'gravity': 'Gravity Tractor',
            'nuclear': 'Nuclear Standoff',
            'laser': 'Laser Ablation',
            'albedo': 'Albedo Modification'
        };
        return names[technique] || technique;
    }
    
    calculateMissDistance() {
        const currentPos = this.impactor2025.position;
        const earthPos = new THREE.Vector3(0, 0, 0);
        const distance = currentPos.distanceTo(earthPos);
        return distance; // In Earth radii
    }
    
    calculateCurrentDeltaV() {
        if (!this.lastDeltaV) return 0;
        return this.lastDeltaV.magnitude;
    }
    
    calculateSeismicMagnitude(impactEnergy) {
        // Richter scale magnitude from impact energy
        const magnitude = (2/3) * Math.log10(impactEnergy * 4.184e9) - 5.87;
        return Math.max(0, magnitude.toFixed(1));
    }
    
    calculateImpactProbability() {
        // Simplified impact probability calculation
        const distance = this.impactor2025.position.length();
        const earthRadius = 1; // Normalized Earth radius
        
        if (distance < earthRadius) {
            return 100;
        } else if (distance < earthRadius * 1.5) {
            return 75;
        } else if (distance < earthRadius * 2) {
            return 50;
        } else {
            return 25;
        }
    }
    
    calculateImpactEnergy() {
        // Kinetic energy calculation
        const velocity = this.impactorData.velocity * 1000; // Convert to m/s
        const kineticEnergy = 0.5 * this.impactorData.mass * Math.pow(velocity, 2);
        
        // Convert to TNT equivalent (1 ton TNT = 4.184e9 J)
        const tntEquivalent = kineticEnergy / (4.184e9);
        
        return tntEquivalent;
    }
    
    calculateCraterDiameter(impactEnergy) {
        // Simplified crater diameter calculation
        const craterDiameter = Math.pow(impactEnergy, 0.33) * 0.1; // Rough scaling
        return craterDiameter;
    }
    
    runSimulation() {
        if (!this.mitigationApplied) {
            this.showMessage('Please apply a mitigation technique first', 'info');
            return;
        }
        
        console.log('🎬 Running Impactor-2025 simulation...');
        this.isAnimating = true;
        
        // Animate asteroid approach
        this.animateAsteroidApproach();
    }
    
    animateAsteroidApproach() {
        const startPosition = this.impactor2025.position.clone();
        const endPosition = new THREE.Vector3(0, 0, 0); // Earth center
        const duration = 5000; // 5 seconds
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate position
            this.impactor2025.position.lerpVectors(startPosition, endPosition, easedProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Check for impact
                this.checkImpact();
            }
        };
        
        animate();
    }
    
    checkImpact() {
        const distance = this.impactor2025.position.length();
        const earthRadius = 1.1; // Slightly larger than Earth for impact detection
        
        if (distance < earthRadius) {
            // Impact occurred
            this.handleImpact();
        } else {
            // Miss - show deflection success
            this.handleDeflection();
        }
    }
    
    handleImpact() {
        console.log('💥 Impact detected!');
        this.showMessage('IMPACT! Mitigation failed to prevent collision.', 'error');
        
        // Stop Earth rotation
        this.earthRotationSpeed = 0;
        
        // Create impact crater
        this.createImpactCrater();
        
        // Update results
        this.updateResults();
    }
    
    handleDeflection() {
        console.log('✅ Deflection successful!');
        this.showMessage('SUCCESS! Asteroid deflected away from Earth.', 'success');
        
        // Update results to show deflection
        const resultsHTML = `
            <div class="result-card">
                <h4>✅ Deflection Successful</h4>
                <p><strong>Technique:</strong> ${this.currentTechnique}</p>
                <p><strong>Result:</strong> Asteroid deflected</p>
                <p><strong>Miss Distance:</strong> ${this.impactor2025.position.length().toFixed(2)} Earth radii</p>
                <p><strong>Status:</strong> Earth is safe!</p>
            </div>
        `;
        
        if (this.resultsPanel) {
            this.resultsPanel.innerHTML = resultsHTML;
        }
    }
    
    createImpactCrater() {
        // Create simple crater geometry
        const craterGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.1, 16);
        const craterMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a2a2a,
            transparent: true,
            opacity: 0.8
        });
        
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(0, 0, 1.01);
        crater.rotation.x = Math.PI / 2;
        crater.name = 'ImpactCrater';
        this.scene.add(crater);
    }
    
    resetSimulation() {
        console.log('🔄 Resetting simulation...');
        
        // Clean up all mitigation effects
        this.cleanupMitigationEffects();
        
        // Reset asteroid position to original
        this.impactor2025.position.set(6, 0, 0);
        
        // Reset trajectory to original
        if (this.trajectory) {
            this.scene.remove(this.trajectory);
        }
        this.createTrajectory();
        
        // Reset Earth rotation
        this.earthRotationSpeed = 0.001;
        
        // Clear any impact craters
        const crater = this.scene.getObjectByName('ImpactCrater');
        if (crater) {
            this.scene.remove(crater);
        }
        
        // Clear results
        if (this.resultsPanel) {
            this.resultsPanel.innerHTML = '<div class="loading-message"><p>Select a mitigation technique to see results</p></div>';
        }
        
        // Reset mitigation state
        this.mitigationApplied = false;
        this.currentTechnique = 'none';
        if (this.techniqueSelect) {
            this.techniqueSelect.value = 'none';
        }
        this.onTechniqueChange('none');
        
        // Reset delta-v tracking
        this.lastDeltaV = null;
        this.originalPosition = null;
        
        // Reset animation state
        this.isAnimating = false;
        
        this.showMessage('Simulation reset to baseline', 'info');
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update performance monitor
        this.updatePerformanceMonitor();
        
        // Rotate Earth smoothly
        if (this.earth && this.earthRotationSpeed > 0) {
            this.earth.rotation.y += this.earthRotationSpeed;
        }
        
        // Rotate atmosphere slightly faster
        const atmosphere = this.scene.getObjectByName('Atmosphere');
        if (atmosphere) {
            atmosphere.rotation.y += this.earthRotationSpeed * 1.1;
        }
        
        // Rotate outer glow even faster
        const outerGlow = this.scene.getObjectByName('OuterGlow');
        if (outerGlow) {
            outerGlow.rotation.y += this.earthRotationSpeed * 1.2;
        }
        
        // Rotate clouds slightly faster than Earth
        const clouds = this.scene.getObjectByName('Clouds');
        if (clouds) {
            clouds.rotation.y += this.earthRotationSpeed * 1.05;
        }
        
        // Rotate city lights with Earth
        const cityLights = this.scene.getObjectByName('CityLights');
        if (cityLights) {
            cityLights.rotation.y += this.earthRotationSpeed;
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Debug render every 60 frames
        if (this.performanceMonitor.frameCount % 60 === 0) {
            console.log('🎬 Rendering frame:', this.performanceMonitor.frameCount);
            console.log('🌍 Earth visible:', this.earth ? this.earth.visible : 'null');
            console.log('🪨 Asteroid visible:', this.impactor2025 ? this.impactor2025.visible : 'null');
            console.log('📷 Camera position:', this.camera.position);
            console.log('🎯 Scene children count:', this.scene.children.length);
        }
    }
    
    updatePerformanceMonitor() {
        const currentTime = performance.now();
        this.performanceMonitor.frameCount++;
        
        if (currentTime - this.performanceMonitor.lastTime >= 1000) {
            this.performanceMonitor.fps = this.performanceMonitor.frameCount;
            this.performanceMonitor.frameCount = 0;
            this.performanceMonitor.lastTime = currentTime;
            this.performanceMonitor.isLowPerformance = this.performanceMonitor.fps < 30;
        }
    }
    
    onWindowResize() {
        const container = document.getElementById('impactor-simulator');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    showMessage(message, type = 'info') {
        const statusMessage = document.getElementById('statusMessage');
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `status-message ${type} show`;
            
            setTimeout(() => {
                statusMessage.classList.remove('show');
            }, 3000);
        }
    }
}

// Initialize simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImpactorMitigationSimulator();
});