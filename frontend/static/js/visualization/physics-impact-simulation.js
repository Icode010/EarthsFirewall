// Physics-Based Impact Simulation
console.log('💥 Loading physics impact simulation...');

// Impact Physics Configuration
const IMPACT_PHYSICS = {
    earthRadius: 6371, // km
    impactSpeed: 15.2, // km/s
    impactAngle: 45, // degrees
    craterScaling: 0.1, // km per (J)^(1/3)
    blastScaling: 1.2, // km per (MT)^(1/3)
    thermalScaling: 3.0, // km per (MT)^(1/3)
    seismicScaling: 0.5, // km per (MT)^(1/3)
    maxSimulationTime: 60, // seconds
    timeStep: 0.016 // 60 FPS
};

// Global impact simulation variables
let impactSimulation = {
    isRunning: false,
    time: 0,
    asteroid: null,
    earth: null,
    impactPoint: null,
    crater: null,
    blastWave: null,
    thermalWave: null,
    seismicWave: null,
    ejecta: null,
    particles: null
};

// Impact simulation state
let impactState = {
    energy: 0,
    tntEquivalent: 0,
    craterDiameter: 0,
    blastRadius: 0,
    thermalRadius: 0,
    seismicRadius: 0,
    ejectaVelocity: 0,
    shockWaveVelocity: 0,
    impactPressure: 0
};

// Create physics-based impact simulation
function createImpactSimulation(asteroidData, impactPoint) {
    console.log('💥 Creating physics impact simulation...');
    
    // Calculate impact physics
    calculateImpactPhysics(asteroidData);
    
    // Create impact point marker
    createImpactPointMarker(impactPoint);
    
    // Create crater
    createImpactCrater();
    
    // Create blast wave
    createBlastWave();
    
    // Create thermal wave
    createThermalWave();
    
    // Create seismic wave
    createSeismicWave();
    
    // Create ejecta
    createEjecta();
    
    // Create particle effects
    createImpactParticles();
    
    console.log('✅ Physics impact simulation created!');
    return impactSimulation;
}

// Calculate impact physics
function calculateImpactPhysics(asteroidData) {
    const { diameter, velocity, density } = asteroidData;
    
    // Calculate mass
    const radius = diameter / 2; // km
    const volume = (4/3) * Math.PI * Math.pow(radius * 1000, 3); // m³
    const mass = volume * density; // kg
    
    // Calculate kinetic energy
    const velocityMs = velocity * 1000; // m/s
    const energy = 0.5 * mass * Math.pow(velocityMs, 2); // J
    
    // Calculate TNT equivalent
    const tntEquivalent = energy / (4.184e15); // megatons
    
    // Calculate crater diameter
    const craterDiameter = IMPACT_PHYSICS.craterScaling * Math.pow(energy, 1/3) / 1000; // km
    
    // Calculate blast radius
    const blastRadius = IMPACT_PHYSICS.blastScaling * Math.pow(tntEquivalent, 1/3); // km
    
    // Calculate thermal radius
    const thermalRadius = IMPACT_PHYSICS.thermalScaling * Math.pow(tntEquivalent, 1/3); // km
    
    // Calculate seismic radius
    const seismicRadius = IMPACT_PHYSICS.seismicScaling * Math.pow(tntEquivalent, 1/3); // km
    
    // Calculate ejecta velocity
    const ejectaVelocity = velocity * 0.1; // km/s
    
    // Calculate shock wave velocity
    const shockWaveVelocity = velocity * 1.5; // km/s
    
    // Calculate impact pressure
    const impactPressure = density * Math.pow(velocityMs, 2); // Pa
    
    // Update impact state
    impactState = {
        energy,
        tntEquivalent,
        craterDiameter,
        blastRadius,
        thermalRadius,
        seismicRadius,
        ejectaVelocity,
        shockWaveVelocity,
        impactPressure
    };
    
    console.log('Impact Physics:', impactState);
}

// Create impact point marker
function createImpactPointMarker(impactPoint) {
    const geometry = new THREE.SphereGeometry(0.01, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8
    });
    
    impactSimulation.impactPoint = new THREE.Mesh(geometry, material);
    impactSimulation.impactPoint.position.set(
        impactPoint.x, impactPoint.y, impactPoint.z
    );
    scene.add(impactSimulation.impactPoint);
}

// Create impact crater
function createImpactCrater() {
    const craterDiameter = impactState.craterDiameter;
    const craterDepth = craterDiameter * 0.2; // 20% of diameter
    
    // Create crater geometry
    const craterGeometry = new THREE.CylinderGeometry(
        craterDiameter / 2,
        craterDiameter / 2,
        craterDepth,
        32
    );
    
    const craterMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.8
    });
    
    impactSimulation.crater = new THREE.Mesh(craterGeometry, craterMaterial);
    impactSimulation.crater.position.y = -craterDepth / 2;
    impactSimulation.crater.visible = false; // Start hidden
    scene.add(impactSimulation.crater);
}

// Create blast wave
function createBlastWave() {
    const blastRadius = impactState.blastRadius;
    
    // Create blast wave geometry
    const blastGeometry = new THREE.RingGeometry(
        blastRadius * 0.1,
        blastRadius,
        32
    );
    
    const blastMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    impactSimulation.blastWave = new THREE.Mesh(blastGeometry, blastMaterial);
    impactSimulation.blastWave.position.y = 0.01;
    impactSimulation.blastWave.visible = false;
    scene.add(impactSimulation.blastWave);
}

// Create thermal wave
function createThermalWave() {
    const thermalRadius = impactState.thermalRadius;
    
    // Create thermal wave geometry
    const thermalGeometry = new THREE.RingGeometry(
        thermalRadius * 0.1,
        thermalRadius,
        32
    );
    
    const thermalMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    impactSimulation.thermalWave = new THREE.Mesh(thermalGeometry, thermalMaterial);
    impactSimulation.thermalWave.position.y = 0.02;
    impactSimulation.thermalWave.visible = false;
    scene.add(impactSimulation.thermalWave);
}

// Create seismic wave
function createSeismicWave() {
    const seismicRadius = impactState.seismicRadius;
    
    // Create seismic wave geometry
    const seismicGeometry = new THREE.RingGeometry(
        seismicRadius * 0.1,
        seismicRadius,
        32
    );
    
    const seismicMaterial = new THREE.MeshBasicMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    
    impactSimulation.seismicWave = new THREE.Mesh(seismicGeometry, seismicMaterial);
    impactSimulation.seismicWave.position.y = 0.03;
    impactSimulation.seismicWave.visible = false;
    scene.add(impactSimulation.seismicWave);
}

// Create ejecta
function createEjecta() {
    const ejectaCount = 1000;
    const ejectaGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(ejectaCount * 3);
    const colors = new Float32Array(ejectaCount * 3);
    const sizes = new Float32Array(ejectaCount);
    
    for (let i = 0; i < ejectaCount; i++) {
        const i3 = i * 3;
        
        // Random positions around impact point
        positions[i3] = (Math.random() - 0.5) * 0.1;
        positions[i3 + 1] = Math.random() * 0.2;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        // Ejecta colors
        colors[i3] = 0.8;     // Red
        colors[i3 + 1] = 0.4; // Green
        colors[i3 + 2] = 0.2; // Blue
        
        // Random sizes
        sizes[i] = Math.random() * 0.01 + 0.005;
    }
    
    ejectaGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    ejectaGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    ejectaGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const ejectaMaterial = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        sizeAttenuation: true,
        alphaTest: 0.1,
        opacity: 0.8
    });
    
    impactSimulation.ejecta = new THREE.Points(ejectaGeometry, ejectaMaterial);
    impactSimulation.ejecta.visible = false;
    scene.add(impactSimulation.ejecta);
}

// Create impact particles
function createImpactParticles() {
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions
        positions[i3] = (Math.random() - 0.5) * 0.2;
        positions[i3 + 1] = Math.random() * 0.3;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
        
        // Particle colors
        colors[i3] = 1.0;     // Red
        colors[i3 + 1] = 0.6; // Green
        colors[i3 + 2] = 0.2; // Blue
        
        // Random sizes
        sizes[i] = Math.random() * 0.02 + 0.01;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        sizeAttenuation: true,
        alphaTest: 0.1,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    
    impactSimulation.particles = new THREE.Points(particleGeometry, particleMaterial);
    impactSimulation.particles.visible = false;
    scene.add(impactSimulation.particles);
}

// Start impact simulation
function startImpactSimulation() {
    console.log('💥 Starting impact simulation...');
    
    impactSimulation.isRunning = true;
    impactSimulation.time = 0;
    
    // Start simulation loop
    animateImpactSimulation();
}

// Animate impact simulation
function animateImpactSimulation() {
    if (!impactSimulation.isRunning) return;
    
    const time = impactSimulation.time;
    const progress = time / IMPACT_PHYSICS.maxSimulationTime;
    
    // Update crater formation
    updateCraterFormation(progress);
    
    // Update blast wave
    updateBlastWave(progress);
    
    // Update thermal wave
    updateThermalWave(progress);
    
    // Update seismic wave
    updateSeismicWave(progress);
    
    // Update ejecta
    updateEjecta(progress);
    
    // Update particles
    updateImpactParticles(progress);
    
    // Update time
    impactSimulation.time += IMPACT_PHYSICS.timeStep;
    
    // Check if simulation is complete
    if (time >= IMPACT_PHYSICS.maxSimulationTime) {
        impactSimulation.isRunning = false;
        console.log('💥 Impact simulation complete!');
    } else {
        requestAnimationFrame(animateImpactSimulation);
    }
}

// Update crater formation
function updateCraterFormation(progress) {
    if (!impactSimulation.crater) return;
    
    if (progress > 0.1) {
        impactSimulation.crater.visible = true;
        impactSimulation.crater.scale.setScalar(Math.min(1, (progress - 0.1) * 2));
    }
}

// Update blast wave
function updateBlastWave(progress) {
    if (!impactSimulation.blastWave) return;
    
    if (progress > 0.05) {
        impactSimulation.blastWave.visible = true;
        const scale = Math.min(1, (progress - 0.05) * 3);
        impactSimulation.blastWave.scale.setScalar(scale);
        impactSimulation.blastWave.material.opacity = 0.3 * (1 - progress);
    }
}

// Update thermal wave
function updateThermalWave(progress) {
    if (!impactSimulation.thermalWave) return;
    
    if (progress > 0.1) {
        impactSimulation.thermalWave.visible = true;
        const scale = Math.min(1, (progress - 0.1) * 2);
        impactSimulation.thermalWave.scale.setScalar(scale);
        impactSimulation.thermalWave.material.opacity = 0.2 * (1 - progress);
    }
}

// Update seismic wave
function updateSeismicWave(progress) {
    if (!impactSimulation.seismicWave) return;
    
    if (progress > 0.2) {
        impactSimulation.seismicWave.visible = true;
        const scale = Math.min(1, (progress - 0.2) * 1.5);
        impactSimulation.seismicWave.scale.setScalar(scale);
        impactSimulation.seismicWave.material.opacity = 0.4 * (1 - progress);
    }
}

// Update ejecta
function updateEjecta(progress) {
    if (!impactSimulation.ejecta) return;
    
    if (progress > 0.05) {
        impactSimulation.ejecta.visible = true;
        
        // Animate ejecta particles
        const positions = impactSimulation.ejecta.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.01;
            positions[i + 1] += Math.random() * 0.02;
            positions[i + 2] += (Math.random() - 0.5) * 0.01;
        }
        
        impactSimulation.ejecta.geometry.attributes.position.needsUpdate = true;
        impactSimulation.ejecta.material.opacity = 0.8 * (1 - progress);
    }
}

// Update impact particles
function updateImpactParticles(progress) {
    if (!impactSimulation.particles) return;
    
    if (progress > 0.02) {
        impactSimulation.particles.visible = true;
        
        // Animate particles
        const positions = impactSimulation.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * 0.02;
            positions[i + 1] += Math.random() * 0.03;
            positions[i + 2] += (Math.random() - 0.5) * 0.02;
        }
        
        impactSimulation.particles.geometry.attributes.position.needsUpdate = true;
        impactSimulation.particles.material.opacity = 0.9 * (1 - progress);
    }
}

// Stop impact simulation
function stopImpactSimulation() {
    impactSimulation.isRunning = false;
}

// Reset impact simulation
function resetImpactSimulation() {
    stopImpactSimulation();
    
    // Hide all effects
    if (impactSimulation.crater) impactSimulation.crater.visible = false;
    if (impactSimulation.blastWave) impactSimulation.blastWave.visible = false;
    if (impactSimulation.thermalWave) impactSimulation.thermalWave.visible = false;
    if (impactSimulation.seismicWave) impactSimulation.seismicWave.visible = false;
    if (impactSimulation.ejecta) impactSimulation.ejecta.visible = false;
    if (impactSimulation.particles) impactSimulation.particles.visible = false;
    
    impactSimulation.time = 0;
}

// Get impact state
function getImpactState() {
    return impactState;
}

// Get simulation progress
function getSimulationProgress() {
    return impactSimulation.time / IMPACT_PHYSICS.maxSimulationTime;
}

// Export functions for use in other modules
window.ImpactSimulation = {
    createImpactSimulation,
    startImpactSimulation,
    stopImpactSimulation,
    resetImpactSimulation,
    getImpactState,
    getSimulationProgress
};
