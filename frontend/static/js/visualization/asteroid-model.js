// 🪨 Amazing Asteroid Model - Realistic Physics & Animation
console.log('🪨 Loading amazing asteroid model...');

// Asteroid Physics Constants
const ASTEROID_PHYSICS = {
    density: 3000, // kg/m³
    rotationSpeed: 0.02,
    trailLength: 100,
    trailOpacity: 0.6
};

// Create amazing asteroid with realistic features
function createAmazingAsteroid(diameter = 0.02, position = {x: 0, y: 0, z: 3}) {
    console.log('🪨 Creating amazing asteroid...');
    
    // Create irregular asteroid geometry
    const asteroidGeometry = createIrregularAsteroidGeometry(diameter);
    
    // Create realistic asteroid material
    const asteroidMaterial = createAsteroidMaterial();
    
    // Create asteroid mesh
    const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroidMesh.position.set(position.x, position.y, position.z);
    asteroidMesh.castShadow = true;
    asteroidMesh.receiveShadow = true;
    asteroidMesh.name = 'Asteroid';
    
    // Store asteroid data
    asteroidMesh.userData = {
        diameter: diameter,
        velocity: { x: 0, y: 0, z: -0.1 },
        rotationSpeed: ASTEROID_PHYSICS.rotationSpeed,
        isAnimating: false
    };
    
    console.log('✅ Amazing asteroid created!');
    return asteroidMesh;
}

// Create irregular asteroid geometry
function createIrregularAsteroidGeometry(diameter) {
    // Start with icosahedron for more realistic shape
    const geometry = new THREE.IcosahedronGeometry(diameter / 2, 2);
    
    // Add random noise to vertices for irregular shape
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const noise = (Math.random() - 0.5) * 0.3;
        vertices[i] += noise * diameter;     // x
        vertices[i + 1] += noise * diameter; // y
        vertices[i + 2] += noise * diameter; // z
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
}

// Create realistic asteroid material
function createAsteroidMaterial() {
    return new THREE.MeshPhongMaterial({
        color: 0x8b7355, // Brownish-gray
        shininess: 30,
        specular: 0x222222,
        roughness: 0.8,
        metalness: 0.1,
        bumpScale: 0.1,
        transparent: false
    });
}

// Set asteroid velocity for animation
function setAsteroidVelocity(velocity) {
    // This function is called by external code to set asteroid movement
    // The velocity will be used by the calling code for animation
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
        opacity: ASTEROID_PHYSICS.trailOpacity,
        transparent: true,
        linewidth: 2
    });
    
    const trailPoints = [];
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    trailLine.name = 'AsteroidTrail';
    
    // Store trail data
    trailLine.userData = {
        points: trailPoints,
        maxPoints: ASTEROID_PHYSICS.trailLength
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