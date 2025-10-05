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
            this.showMessage('Impactor-2025 Mitigation Simulator ready!', 'success');
            
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
            powerPreference: 'high-performance'
        });
        
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
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
        this.resultsPanel = document.getElementById('mitigationResults');
        
        if (!this.techniqueSelect) {
            console.error('❌ UI elements not found!');
            return;
        }
        
        // Setup technique selection handler
        this.techniqueSelect.addEventListener('change', (e) => {
            this.onTechniqueChange(e.target.value);
        });
        
        // Setup action buttons
        const applyBtn = document.getElementById('applyMitigation');
        const resetBtn = document.getElementById('resetSimulation');
        const runBtn = document.getElementById('runSimulation');
        
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyMitigation());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSimulation());
        if (runBtn) runBtn.addEventListener('click', () => this.runSimulation());
        
        // Initialize with default technique
        this.onTechniqueChange('none');
        
        console.log('✅ UI setup complete');
    }
    
    async createEarth() {
        // Create Earth geometry
        const earthGeometry = new THREE.SphereGeometry(1, 64, 32);
        
        // Create Earth material with bright color for visibility
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a9eff, // Bright blue for visibility
            shininess: 100,
            transparent: false
        });
        
        // Create Earth mesh
        this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        this.earth.name = 'Earth';
        this.earth.userData = { type: 'earth' };
        this.scene.add(this.earth);
        
        // Add subtle rotation
        this.earth.rotation.y = Math.PI;
        
        console.log('🌍 Earth created and added to scene');
    }
    
    async createImpactor2025() {
        // Create irregular asteroid geometry
        const asteroidGeometry = new THREE.IcosahedronGeometry(0.1, 2);
        
        // Add noise to vertices for irregular shape
        const vertices = asteroidGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            const noise = (Math.random() - 0.5) * 0.1;
            vertices[i] += noise;
            vertices[i + 1] += noise;
            vertices[i + 2] += noise;
        }
        asteroidGeometry.attributes.position.needsUpdate = true;
        asteroidGeometry.computeVertexNormals();
        
        // Create asteroid material
        const asteroidMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b7355,
            shininess: 30,
            transparent: false
        });
        
        // Create asteroid mesh
        this.impactor2025 = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        this.impactor2025.name = 'Impactor-2025';
        this.impactor2025.userData = { 
            type: 'asteroid',
            data: this.impactorData
        };
        
        // Position asteroid far from Earth
        this.impactor2025.position.set(6, 0, 0);
        this.scene.add(this.impactor2025);
        
        console.log('🪨 Impactor-2025 created and added to scene');
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
        // Ambient light - brighter to ensure visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);
        
        // Directional light (sun) - stronger lighting
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0x4a9eff, 0.5);
        fillLight.position.set(-3, 2, -3);
        this.scene.add(fillLight);
        
        // Point light for asteroid
        const pointLight = new THREE.PointLight(0x4a9eff, 0.5, 10);
        pointLight.position.copy(this.impactor2025.position);
        this.scene.add(pointLight);
        
        console.log('💡 Lighting setup complete');
    }
    
    createStarfield() {
        // Create starfield background
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2000;
            positions[i + 1] = (Math.random() - 0.5) * 2000;
            positions[i + 2] = (Math.random() - 0.5) * 2000;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            alphaTest: 0.1
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        
        console.log('⭐ Starfield created');
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
            this.techniqueDescription.innerHTML = `<p>${descriptions[technique]}</p>`;
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
                const acceleration = force / this.impactorData.mass;
                const totalTime = duration * 30 * 24 * 3600; // Convert months to seconds
                deltaV.magnitude = acceleration * totalTime * 0.1; // Scale down for realism
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
                const surfaceArea = 4 * Math.PI * Math.pow(this.impactorData.diameter / 2, 2); // m²
                const totalAblation = ablationRate * surfaceArea; // kg
                const exhaustVelocity = 1000; // m/s (typical for laser ablation)
                deltaV.magnitude = (totalAblation * exhaustVelocity) / this.impactorData.mass;
                break;
                
            case 'albedo':
                const coverage = parseFloat(document.getElementById('coverage')?.value || 50);
                const effectDuration = parseFloat(document.getElementById('effectDuration')?.value || 2);
                const albedoLeadTime = parseFloat(document.getElementById('albedoLeadTime')?.value || 2);
                
                const solarConstant = 1361; // W/m²
                const asteroidRadius = this.impactorData.diameter / 2;
                const surfaceArea = 4 * Math.PI * Math.pow(asteroidRadius, 2);
                const albedoChange = (coverage / 100) * 0.1; // 10% max albedo change
                const thermalForce = solarConstant * surfaceArea * albedoChange / (3e8); // N
                const acceleration = thermalForce / this.impactorData.mass;
                const totalTime = effectDuration * 365 * 24 * 3600; // years to seconds
                deltaV.magnitude = acceleration * totalTime * 0.01; // Very small effect
                break;
        }
        
        // Ensure minimum delta-v for visibility
        deltaV.magnitude = Math.max(deltaV.magnitude, 0.001);
        
        return deltaV;
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
        
        // Rotate Earth
        if (this.earth && this.earthRotationSpeed > 0) {
            this.earth.rotation.y += this.earthRotationSpeed;
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
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