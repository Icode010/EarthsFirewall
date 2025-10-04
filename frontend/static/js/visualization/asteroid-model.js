// 🪨 Amazing Asteroid Model - Based on provided code
console.log('🪨 Loading amazing asteroid model...');

// Create amazing asteroid with realistic features using the provided code
function createAmazingAsteroid(diameter = 0.02, position = {x: 0, y: 0, z: 3}) {
    console.log('🪨 Creating amazing asteroid...');
    
    // Create asteroid with high detail smooth geometry
    const geometry = new THREE.SphereGeometry(diameter / 2, 128, 128);
    
    // Add natural random variation to vertices
    const positions = geometry.attributes.position;
    const vertexCount = positions.count;
    
    // Create many random craters
    const craterCount = 120;
    const craters = [];
    for (let i = 0; i < craterCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = diameter / 2;
        
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
        
        // Create oval shape by stretching along one axis
        const ovalFactorX = 1.3;
        const ovalFactorY = 0.85;
        const ovalFactorZ = 1.0;
        
        // Add subtle irregular bulges and rounded edges (not sharp)
        const bulge1 = Math.max(0, Math.sin(nx * 2.1 + 10) * Math.cos(ny * 1.8 + 20)) * 0.12;
        const bulge2 = Math.max(0, Math.sin(ny * 2.4 + 30) * Math.cos(nz * 2.2 + 40)) * 0.10;
        const bulge3 = Math.max(0, Math.sin(nz * 1.9 + 50) * Math.cos(nx * 2.3 + 60)) * 0.08;
        
        // Start with perfectly smooth sphere
        let displacement = 1.0 + bulge1 + bulge2 + bulge3;
        
        // Add very gentle, smooth organic shape variation
        const smooth1 = Math.sin(x * 1.3 + 17.5) * Math.cos(y * 1.5 + 23.7) * 0.04;
        const smooth2 = Math.sin(y * 1.7 + 41.2) * Math.cos(z * 1.4 + 33.8) * 0.03;
        const smooth3 = Math.sin(z * 1.2 + 52.1) * Math.cos(x * 1.6 + 61.4) * 0.02;
        
        displacement += smooth1 + smooth2 + smooth3;
        
        // Very subtle overall shape variation (no spikes, just gentle curves)
        const gentleVariation = (Math.random() - 0.5) * 0.03;
        displacement += gentleVariation;
        
        // Add many craters with very smooth, gradual falloff
        for (let j = 0; j < craters.length; j++) {
            const crater = craters[j];
            const dx = x - crater.x;
            const dy = y - crater.y;
            const dz = z - crater.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < crater.radius) {
                const craterEffect = 1 - (dist / crater.radius);
                // Very smooth bowl-shaped crater (power of 4 for extra smoothness)
                const craterDepth = Math.pow(craterEffect, 4) * crater.depth;
                displacement -= craterDepth;
                
                // Very subtle, smooth crater rim
                if (dist > crater.radius * 0.8) {
                    const rimEffect = (dist - crater.radius * 0.8) / (crater.radius * 0.2);
                    displacement += Math.sin(rimEffect * Math.PI) * crater.depth * 0.08;
                }
            }
        }
        
        // Extremely subtle micro-detail (almost imperceptible)
        const microDetail = (Math.random() - 0.5) * 0.008;
        displacement += microDetail;
        
        // Ensure smooth, positive displacement only
        displacement = Math.max(displacement, 0.7);
        
        // Apply oval shape transformation
        positions.setXYZ(
            i, 
            nx * displacement * diameter / 2 * ovalFactorX, 
            ny * displacement * diameter / 2 * ovalFactorY, 
            nz * displacement * diameter / 2 * ovalFactorZ
        );
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Create natural rocky material with smooth shading
    const material = new THREE.MeshStandardMaterial({
        color: 0x5a5a5a,
        roughness: 0.95,
        metalness: 0.05,
        flatShading: false
    });
    
    const asteroidMesh = new THREE.Mesh(geometry, material);
    asteroidMesh.position.set(position.x, position.y, position.z);
    asteroidMesh.castShadow = true;
    asteroidMesh.receiveShadow = true;
    asteroidMesh.name = 'Asteroid';
    
    // Store asteroid data
    asteroidMesh.userData = {
        diameter: diameter,
        velocity: { x: 0, y: 0, z: -0.1 },
        rotationSpeed: 0.005,
        isAnimating: false
    };
    
    console.log('✅ Amazing asteroid created!');
    return asteroidMesh;
}

// Set asteroid velocity for animation
function setAsteroidVelocity(velocity) {
    // This function is called by external code to set asteroid movement
    if (typeof window.currentAsteroidVelocity === 'undefined') {
        window.currentAsteroidVelocity = {};
    }
    window.currentAsteroidVelocity = velocity;
}

// Create asteroid trail (called by external code)
function createAsteroidTrail(scene, asteroidMesh) {
    if (!scene || !asteroidMesh) return null;
    
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
        color: 0xff6b6b,
        opacity: 0.6,
        transparent: true,
        linewidth: 2
    });
    
    const trailPoints = [];
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    trailLine.name = 'AsteroidTrail';
    
    // Store trail data
    trailLine.userData = {
        points: trailPoints,
        maxPoints: 100
    };
    
    scene.add(trailLine);
    return trailLine;
}

// Update asteroid trail (called by external code)
function updateAsteroidTrail(trail, asteroidPosition) {
    if (!trail || !asteroidPosition) return;
    
    const trailData = trail.userData;
    trailData.points.push(new THREE.Vector3(asteroidPosition.x, asteroidPosition.y, asteroidPosition.z));
    
    // Limit trail length
    if (trailData.points.length > trailData.maxPoints) {
        trailData.points.shift();
    }
    
    // Update trail geometry
    if (trailData.points.length > 1) {
        trail.geometry.setFromPoints(trailData.points);
    }
}

// Create asteroid particles (called by external code)
function createAsteroidParticles(scene, asteroidMesh) {
    if (!scene || !asteroidMesh) return null;
    
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 0.1;     // x
        positions[i + 1] = (Math.random() - 0.5) * 0.1; // y
        positions[i + 2] = (Math.random() - 0.5) * 0.1; // z
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffaa00,
        size: 0.005,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.name = 'AsteroidParticles';
    
    scene.add(particleSystem);
    return particleSystem;
}

// Update asteroid particles (called by external code)
function updateAsteroidParticles(particles, asteroidMesh) {
    if (!particles || !asteroidMesh) return;
    
    particles.position.copy(asteroidMesh.position);
    particles.rotation.copy(asteroidMesh.rotation);
    
    // Animate particles
    const positions = particles.geometry.attributes.position.array;
    for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.001;
    }
    particles.geometry.attributes.position.needsUpdate = true;
}

// Create impact explosion effect (called by external code)
function createImpactExplosion(scene, position) {
    if (!scene || !position) return null;
    
    const explosionGeometry = new THREE.SphereGeometry(0.1, 8, 6);
    const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.8
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.set(position.x, position.y, position.z);
    explosion.name = 'ImpactExplosion';
    
    scene.add(explosion);
    
    // Animate explosion
    const startTime = Date.now();
    const animateExplosion = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const scale = 1 + elapsed * 5;
        const opacity = Math.max(0, 1 - elapsed * 2);
        
        explosion.scale.setScalar(scale);
        explosion.material.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animateExplosion);
        } else {
            scene.remove(explosion);
        }
    };
    
    animateExplosion();
    return explosion;
}

// Create impact crater (called by external code)
function createImpactCrater(scene, position, size = 0.5) {
    if (!scene || !position) return null;
    
    const craterGeometry = new THREE.CylinderGeometry(
        size * 0.5, // top radius
        size * 0.3, // bottom radius
        size * 0.1, // height
        16
    );
    
    const craterMaterial = new THREE.MeshPhongMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.8
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.set(position.x, position.y - size * 0.05, position.z);
    crater.rotation.x = Math.PI / 2;
    crater.name = 'ImpactCrater';
    
    scene.add(crater);
    return crater;
}

// Create shockwave effect (called by external code)
function createShockwave(scene, position, maxRadius = 2) {
    if (!scene || !position) return null;
    
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.set(position.x, position.y, position.z);
    shockwave.rotation.x = Math.PI / 2;
    shockwave.name = 'Shockwave';
    
    scene.add(shockwave);
    
    // Animate shockwave
    const startTime = Date.now();
    const animateShockwave = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const scale = elapsed * 2;
        const opacity = Math.max(0, 1 - elapsed * 0.5);
        
        shockwave.scale.setScalar(scale);
        shockwave.material.opacity = opacity;
        
        if (opacity > 0 && scale < maxRadius) {
            requestAnimationFrame(animateShockwave);
        } else {
            scene.remove(shockwave);
        }
    };
    
    animateShockwave();
    return shockwave;
}

// Clean up asteroid and related objects (called by external code)
function cleanupAsteroid(scene, asteroidMesh) {
    if (!scene) return;
    
    // Remove asteroid mesh
    if (asteroidMesh) {
        scene.remove(asteroidMesh);
    }
    
    // Remove trail
    const trail = scene.getObjectByName('AsteroidTrail');
    if (trail) {
        scene.remove(trail);
    }
    
    // Remove particles
    const particles = scene.getObjectByName('AsteroidParticles');
    if (particles) {
        scene.remove(particles);
    }
    
    // Remove explosion
    const explosion = scene.getObjectByName('ImpactExplosion');
    if (explosion) {
        scene.remove(explosion);
    }
    
    // Remove crater
    const crater = scene.getObjectByName('ImpactCrater');
    if (crater) {
        scene.remove(crater);
    }
    
    // Remove shockwave
    const shockwave = scene.getObjectByName('Shockwave');
    if (shockwave) {
        scene.remove(shockwave);
    }
}

// Export functions for global use
window.createAmazingAsteroid = createAmazingAsteroid;
window.setAsteroidVelocity = setAsteroidVelocity;
window.createAsteroidTrail = createAsteroidTrail;
window.updateAsteroidTrail = updateAsteroidTrail;
window.createAsteroidParticles = createAsteroidParticles;
window.updateAsteroidParticles = updateAsteroidParticles;
window.createImpactExplosion = createImpactExplosion;
window.createImpactCrater = createImpactCrater;
window.createShockwave = createShockwave;
window.cleanupAsteroid = cleanupAsteroid;

console.log('🪨 Asteroid model module loaded!');