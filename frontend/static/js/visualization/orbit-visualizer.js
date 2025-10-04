// 🛤️ Amazing Orbit Visualizer - Realistic Orbital Mechanics
console.log('🛤️ Loading amazing orbit visualizer...');

// Orbital Mechanics Constants
const ORBITAL_CONSTANTS = {
    G: 6.674e-11, // Gravitational constant
    EARTH_MASS: 5.972e24, // kg
    EARTH_RADIUS: 6371000, // m
    AU: 149597870700, // Astronomical unit in meters
    SECONDS_PER_DAY: 86400
};

// Global orbit variables
let orbitLine, orbitPoints = [];
let isOrbitCalculating = false;
let currentOrbit = null;

// Calculate orbital trajectory using Kepler's laws
function calculateOrbitalTrajectory(orbitalElements, timeSteps = 100) {
    console.log('🛤️ Calculating orbital trajectory...');
    
    const { a, e, i, Ω, ω, M } = orbitalElements; // Semi-major axis, eccentricity, inclination, etc.
    const trajectory = [];
    
    for (let t = 0; t < timeSteps; t++) {
        const time = (t / timeSteps) * 2 * Math.PI; // One complete orbit
        
        // Calculate true anomaly using Kepler's equation
        const E = solveKeplersEquation(M + time, e);
        const ν = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
        
        // Calculate position in orbital plane
        const r = a * (1 - e * e) / (1 + e * Math.cos(ν));
        const x_orb = r * Math.cos(ν);
        const y_orb = r * Math.sin(ν);
        
        // Transform to 3D space
        const position = transformOrbitalTo3D(x_orb, y_orb, i, Ω, ω);
        trajectory.push(position);
    }
    
    return trajectory;
}

// Solve Kepler's equation using Newton-Raphson method
function solveKeplersEquation(M, e, tolerance = 1e-6) {
    let E = M; // Initial guess
    
    for (let i = 0; i < 10; i++) {
        const f = E - e * Math.sin(E) - M;
        const fPrime = 1 - e * Math.cos(E);
        
        if (Math.abs(f) < tolerance) break;
        
        E = E - f / fPrime;
    }
    
    return E;
}

// Transform orbital coordinates to 3D space
function transformOrbitalTo3D(x, y, i, Ω, ω) {
    const cos_i = Math.cos(i);
    const sin_i = Math.sin(i);
    const cos_Ω = Math.cos(Ω);
    const sin_Ω = Math.sin(Ω);
    const cos_ω = Math.cos(ω);
    const sin_ω = Math.sin(ω);
    
    // Rotation matrices
    const x_rot = x * (cos_ω * cos_Ω - sin_ω * sin_Ω * cos_i) - y * (sin_ω * cos_Ω + cos_ω * sin_Ω * cos_i);
    const y_rot = x * (cos_ω * sin_Ω + sin_ω * cos_Ω * cos_i) + y * (cos_ω * cos_Ω - sin_ω * sin_Ω * cos_i);
    const z_rot = x * (sin_ω * sin_i) + y * (cos_ω * sin_i);
    
    return new THREE.Vector3(x_rot, y_rot, z_rot);
}

// Create amazing orbit visualization
function createAmazingOrbit(orbitalElements, color = 0xff6b35) {
    console.log('🛤️ Creating amazing orbit visualization...');
    
    // Remove existing orbit
    if (orbitLine) {
        scene.remove(orbitLine);
    }
    
    // Calculate trajectory
    const trajectory = calculateOrbitalTrajectory(orbitalElements);
    orbitPoints = trajectory;
    
    // Create orbit line
    const geometry = new THREE.BufferGeometry().setFromPoints(trajectory);
    const material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        transparent: true,
        opacity: 0.8
    });
    
    orbitLine = new THREE.Line(geometry, material);
    scene.add(orbitLine);
    
    // Add orbit markers
    createOrbitMarkers(trajectory);
    
    console.log('✅ Amazing orbit created!');
    return orbitLine;
}

// Create orbit markers (periapsis, apoapsis, etc.)
function createOrbitMarkers(trajectory) {
    if (trajectory.length < 2) return;
    
    // Find periapsis (closest point to Earth)
    let minDistance = Infinity;
    let periapsisIndex = 0;
    
    for (let i = 0; i < trajectory.length; i++) {
        const distance = trajectory[i].length();
        if (distance < minDistance) {
            minDistance = distance;
            periapsisIndex = i;
        }
    }
    
    // Create periapsis marker
    const periapsisGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const periapsisMaterial = new THREE.MeshBasicMaterial({ color: 0xff4757 });
    const periapsisMarker = new THREE.Mesh(periapsisGeometry, periapsisMaterial);
    periapsisMarker.position.copy(trajectory[periapsisIndex]);
    periapsisMarker.name = 'Periapsis';
    scene.add(periapsisMarker);
    
    // Create apoapsis marker (farthest point)
    let maxDistance = 0;
    let apoapsisIndex = 0;
    
    for (let i = 0; i < trajectory.length; i++) {
        const distance = trajectory[i].length();
        if (distance > maxDistance) {
            maxDistance = distance;
            apoapsisIndex = i;
        }
    }
    
    const apoapsisGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const apoapsisMaterial = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const apoapsisMarker = new THREE.Mesh(apoapsisGeometry, apoapsisMaterial);
    apoapsisMarker.position.copy(trajectory[apoapsisIndex]);
    apoapsisMarker.name = 'Apoapsis';
    scene.add(apoapsisMarker);
}

// Create deflection comparison
function createDeflectionComparison(originalOrbit, deflectedOrbit) {
    console.log('🛡️ Creating deflection comparison...');
    
    // Original orbit (red)
    const originalGeometry = new THREE.BufferGeometry().setFromPoints(originalOrbit);
    const originalMaterial = new THREE.LineBasicMaterial({
        color: 0xff4757,
        linewidth: 2,
        transparent: true,
        opacity: 0.6
    });
    const originalLine = new THREE.Line(originalGeometry, originalMaterial);
    scene.add(originalLine);
    
    // Deflected orbit (green)
    const deflectedGeometry = new THREE.BufferGeometry().setFromPoints(deflectedOrbit);
    const deflectedMaterial = new THREE.LineBasicMaterial({
        color: 0x2ed573,
        linewidth: 3,
        transparent: true,
        opacity: 0.8
    });
    const deflectedLine = new THREE.Line(deflectedGeometry, deflectedMaterial);
    scene.add(deflectedLine);
    
    // Find divergence point
    const divergencePoint = findDivergencePoint(originalOrbit, deflectedOrbit);
    if (divergencePoint) {
        createDivergenceMarker(divergencePoint);
    }
    
    return { originalLine, deflectedLine };
}

// Find divergence point between two orbits
function findDivergencePoint(orbit1, orbit2) {
    if (orbit1.length !== orbit2.length) return null;
    
    let maxDistance = 0;
    let divergenceIndex = 0;
    
    for (let i = 0; i < orbit1.length; i++) {
        const distance = orbit1[i].distanceTo(orbit2[i]);
        if (distance > maxDistance) {
            maxDistance = distance;
            divergenceIndex = i;
        }
    }
    
    return orbit1[divergenceIndex];
}

// Create divergence marker
function createDivergenceMarker(position) {
    const markerGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffd700,
        transparent: true,
        opacity: 0.8
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(position);
    marker.name = 'DivergencePoint';
    scene.add(marker);
    
    // Add pulsing animation
    let scale = 1;
    let direction = 1;
    
    function animateMarker() {
        scale += direction * 0.02;
        if (scale > 1.5) direction = -1;
        if (scale < 0.5) direction = 1;
        
        marker.scale.setScalar(scale);
        requestAnimationFrame(animateMarker);
    }
    
    animateMarker();
}

// Calculate impact probability
function calculateImpactProbability(orbitalElements, earthRadius = 0.1) {
    const trajectory = calculateOrbitalTrajectory(orbitalElements);
    
    for (let point of trajectory) {
        if (point.length() < earthRadius) {
            return {
                willImpact: true,
                impactPoint: point,
                impactTime: calculateImpactTime(point, orbitalElements)
            };
        }
    }
    
    return { willImpact: false };
}

// Calculate time to impact
function calculateImpactTime(impactPoint, orbitalElements) {
    // Simplified calculation - in reality this would be more complex
    const distance = impactPoint.length();
    const velocity = Math.sqrt(ORBITAL_CONSTANTS.G * ORBITAL_CONSTANTS.EARTH_MASS / distance);
    return distance / velocity;
}

// Create impact prediction
function createImpactPrediction(orbitalElements) {
    console.log('💥 Creating impact prediction...');
    
    const impactData = calculateImpactProbability(orbitalElements);
    
    if (impactData.willImpact) {
        // Create impact zone on Earth
        createImpactZoneOnEarth(impactData.impactPoint);
        
        // Create countdown timer
        createImpactCountdown(impactData.impactTime);
        
        return impactData;
    }
    
    return null;
}

// Create impact zone on Earth
function createImpactZoneOnEarth(impactPoint) {
    const zoneGeometry = new THREE.RingGeometry(0.05, 0.15, 32);
    const zoneMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4757,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    
    const impactZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
    impactZone.position.copy(impactPoint);
    impactZone.rotation.x = -Math.PI / 2;
    impactZone.name = 'ImpactZone';
    scene.add(impactZone);
    
    // Add pulsing animation
    let scale = 1;
    let direction = 1;
    
    function animateZone() {
        scale += direction * 0.01;
        if (scale > 1.2) direction = -1;
        if (scale < 0.8) direction = 1;
        
        impactZone.scale.setScalar(scale);
        requestAnimationFrame(animateZone);
    }
    
    animateZone();
}

// Create impact countdown
function createImpactCountdown(timeToImpact) {
    const countdownElement = document.getElementById('impact-countdown');
    if (!countdownElement) return;
    
    let timeLeft = timeToImpact;
    
    const countdown = setInterval(() => {
        timeLeft--;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            countdownElement.textContent = 'IMPACT!';
            countdownElement.style.color = '#ff4757';
        } else {
            countdownElement.textContent = `Impact in: ${timeLeft}s`;
            countdownElement.style.color = '#ff6b35';
        }
    }, 1000);
}

// Clear all orbit visualizations
function clearOrbitVisualizations() {
    console.log('🧹 Clearing orbit visualizations...');
    
    // Remove orbit line
    if (orbitLine) {
        scene.remove(orbitLine);
        orbitLine = null;
    }
    
    // Remove all orbit markers
    const markers = scene.children.filter(child => 
        child.name === 'Periapsis' || 
        child.name === 'Apoapsis' || 
        child.name === 'DivergencePoint' ||
        child.name === 'ImpactZone'
    );
    
    markers.forEach(marker => scene.remove(marker));
    
    orbitPoints = [];
    currentOrbit = null;
}

// Export functions
window.createAmazingOrbit = createAmazingOrbit;
window.createDeflectionComparison = createDeflectionComparison;
window.createImpactPrediction = createImpactPrediction;
window.clearOrbitVisualizations = clearOrbitVisualizations;
window.calculateOrbitalTrajectory = calculateOrbitalTrajectory;

console.log('🛤️ Orbit visualizer module loaded!');
