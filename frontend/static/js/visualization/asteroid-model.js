// Ultra Realistic Asteroid Model - Based on provided ultra-realistic code
console.log('Loading ultra-realistic asteroid model...');

// Simplex-like noise function for ultra-realistic terrain
function noise3D(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    
    const A = (X + Y * 57 + Z * 131) * 13;
    const B = (X + 1 + Y * 57 + Z * 131) * 13;
    
    return lerp(w, 
        lerp(v, 
            lerp(u, grad(A, x, y, z), grad(B, x - 1, y, z)),
            lerp(u, grad(A + 57, x, y - 1, z), grad(B + 57, x - 1, y - 1, z))
        ),
        lerp(v,
            lerp(u, grad(A + 131, x, y, z - 1), grad(B + 131, x - 1, y, z - 1)),
            lerp(u, grad(A + 188, x, y - 1, z - 1), grad(B + 188, x - 1, y - 1, z - 1))
        )
    );
}

function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
    return a + t * (b - a);
}

function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function fbm(x, y, z, octaves) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        value += noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    
    return value / maxValue;
}

// Create ultra-realistic asteroid with advanced procedural generation
function createAmazingAsteroid(diameter = 0.02, position = {x: 0, y: 0, z: 3}) {
    console.log('Creating ultra-realistic asteroid...');
    
    // Create ultra-high-detail geometry (200x200 resolution)
    const geometry = new THREE.SphereGeometry(diameter / 2, 200, 200);
    const positions = geometry.attributes.position;
    const vertexCount = positions.count;
    
    // Create realistic crater distribution with complexity levels
    const craterCount = 200;
    const craters = [];
    for (let i = 0; i < craterCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = diameter / 2;
        
        craters.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
            radius: Math.pow(Math.random(), 2) * 0.5 + 0.05,
            depth: Math.pow(Math.random(), 1.5) * 0.25 + 0.05,
            complexity: Math.random()
        });
    }
    
    // Add smaller secondary craters for realism
    const secondaryCraters = [];
    for (let i = 0; i < 100; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = diameter / 2;
        
        secondaryCraters.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
            radius: Math.random() * 0.15 + 0.02,
            depth: Math.random() * 0.08 + 0.02
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
        
        // Irregular asteroid shape with realistic proportions
        const ovalX = 1.4;
        const ovalY = 0.9;
        const ovalZ = 1.1;
        
        // Multi-octave noise for realistic terrain
        let displacement = 1.0;
        displacement += fbm(nx * 2, ny * 2, nz * 2, 6) * 0.10;
        displacement += fbm(nx * 5, ny * 5, nz * 5, 4) * 0.05;
        displacement += fbm(nx * 12, ny * 12, nz * 12, 3) * 0.025;
        
        // Large-scale features (ridges and valleys)
        const ridge1 = Math.abs(noise3D(nx * 1.5, ny * 1.5, nz * 1.5)) * 0.08;
        const ridge2 = Math.abs(noise3D(nx * 2.5 + 100, ny * 2.5 + 100, nz * 2.5 + 100)) * 0.05;
        displacement += ridge1 + ridge2;
        
        // Add main craters with realistic features
        for (let j = 0; j < craters.length; j++) {
            const crater = craters[j];
            const dx = x - crater.x;
            const dy = y - crater.y;
            const dz = z - crater.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < crater.radius) {
                const normalized = dist / crater.radius;
                
                // Complex crater profile
                const craterProfile = Math.pow(1 - normalized, 3) * crater.depth;
                displacement -= craterProfile;
                
                // Crater rim with realistic uplift
                if (normalized > 0.7 && normalized < 0.95) {
                    const rimPos = (normalized - 0.7) / 0.25;
                    const rimHeight = Math.sin(rimPos * Math.PI) * crater.depth * 0.12;
                    displacement += rimHeight;
                }
                
                // Central peak for larger craters
                if (crater.radius > 0.3 && normalized < 0.3) {
                    const peakHeight = (1 - normalized / 0.3) * crater.depth * 0.2;
                    displacement += peakHeight * crater.complexity;
                }
                
                // Crater floor roughness
                if (normalized < 0.6) {
                    const floorNoise = noise3D(x * 30, y * 30, z * 30) * 0.008;
                    displacement += floorNoise;
                }
            }
        }
        
        // Secondary craters
        for (let j = 0; j < secondaryCraters.length; j++) {
            const crater = secondaryCraters[j];
            const dx = x - crater.x;
            const dy = y - crater.y;
            const dz = z - crater.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < crater.radius) {
                const craterEffect = 1 - (dist / crater.radius);
                const craterDepth = Math.pow(craterEffect, 4) * crater.depth;
                displacement -= craterDepth;
            }
        }
        
        // Fine surface detail (regolith texture)
        const microDetail = noise3D(x * 50, y * 50, z * 50) * 0.008;
        displacement += microDetail;
        
        // Boulder fields
        const boulders = Math.max(0, noise3D(x * 20 + 500, y * 20 + 500, z * 20 + 500)) * 0.012;
        displacement += boulders;
        
        displacement = Math.max(displacement, 0.5);
        
        positions.setXYZ(
            i,
            nx * displacement * diameter / 2 * ovalX,
            ny * displacement * diameter / 2 * ovalY,
            nz * displacement * diameter / 2 * ovalZ
        );
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Ultra-realistic material with advanced properties
    const material = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.98,
        metalness: 0.02,
        flatShading: false
    });
    
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    asteroid.position.set(position.x, position.y, position.z);
    
    console.log('Ultra-realistic asteroid created successfully');
    return asteroid;
}

// Create asteroid trail (called by external code)
function createAsteroidTrail(scene, asteroidMesh) {
    if (!scene || !asteroidMesh) return null;
    
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
        color: 0xff4444,
        transparent: true,
        opacity: 0.6,
        linewidth: 3
    });
    
    const trailVertices = [];
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 0.1 + i * 0.05;
        trailVertices.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            -i * 0.1
        );
    }
    
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
    
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    trailLine.name = 'AsteroidTrail';
    trailLine.position.copy(asteroidMesh.position);
    
    scene.add(trailLine);
    return trailLine;
}

// Create asteroid particles (called by external code)
function createAsteroidParticles(scene, asteroidMesh) {
    if (!scene || !asteroidMesh) return null;
    
    const particleCount = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.01,
        transparent: true,
        sizeAttenuation: true,
        alphaTest: 0.1,
        opacity: 0.8
    });
    
    const positions = [];
    for (let i = 0; i < particleCount; i++) {
        // Create particles around the asteroid
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.2 + Math.random() * 0.3;
        positions.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            (Math.random() - 0.5) * 0.4
        );
    }
    
    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    particleSystem.name = 'AsteroidParticles';
    particleSystem.position.copy(asteroidMesh.position);
    
    scene.add(particleSystem);
    return particleSystem;
}

// Create impact explosion effect (called by external code)
function createImpactExplosion(scene, position) {
    if (!scene || !position) return null;
    
    const explosionGeometry = new THREE.SphereGeometry(0.1, 8, 6);
    const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 1.0
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.name = 'ImpactExplosion';
    explosion.position.copy(position);
    
    scene.add(explosion);
    
    // Animate explosion
    let scale = 0.1;
    let opacity = 1.0;
    const animateExplosion = () => {
        scale += 0.1;
        opacity -= 0.05;
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
        size * 0.8, size, size * 0.3, 16
    );
    const craterMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        transparent: true,
        opacity: 0.8
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.name = 'ImpactCrater';
    crater.position.copy(position);
    crater.rotation.x = Math.PI / 2;
    
    scene.add(crater);
    return crater;
}

// Create shockwave effect (called by external code)
function createShockwave(scene, position, maxRadius = 2) {
    if (!scene || !position) return null;
    
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.2, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.name = 'Shockwave';
    shockwave.position.copy(position);
    shockwave.rotation.x = Math.PI / 2;
    
    scene.add(shockwave);
    
    // Animate shockwave
    let radius = 0.1;
    let opacity = 0.8;
    const animateShockwave = () => {
        radius += 0.05;
        opacity -= 0.02;
        shockwave.scale.setScalar(radius / 0.1);
        shockwave.material.opacity = opacity;
        
        if (opacity > 0 && radius < maxRadius) {
            requestAnimationFrame(animateShockwave);
        } else {
            scene.remove(shockwave);
        }
    };
    
    animateShockwave();
    return shockwave;
}

// Cleanup asteroid and all related objects
function cleanupAsteroid(scene, asteroid) {
    if (!scene) return;
    
    // Remove asteroid mesh
    if (asteroid) {
        scene.remove(asteroid);
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
    
    // Remove impact effects
    const impactObjects = ['ImpactExplosion', 'ImpactCrater', 'Shockwave'];
    impactObjects.forEach(name => {
        const obj = scene.getObjectByName(name);
        if (obj) {
            scene.remove(obj);
        }
    });
}

// Set asteroid velocity (for external control)
function setAsteroidVelocity(velocity) {
    // This function is called by external code to set asteroid movement
    if (typeof window.currentAsteroidVelocity === 'undefined') {
        window.currentAsteroidVelocity = {};
    }
    window.currentAsteroidVelocity.x = velocity.x || 0;
    window.currentAsteroidVelocity.y = velocity.y || 0;
    window.currentAsteroidVelocity.z = velocity.z || 0;
}

// Export functions for global use
window.createAmazingAsteroid = createAmazingAsteroid;
window.createAsteroidTrail = createAsteroidTrail;
window.createAsteroidParticles = createAsteroidParticles;
window.createImpactExplosion = createImpactExplosion;
window.createImpactCrater = createImpactCrater;
window.createShockwave = createShockwave;
window.cleanupAsteroid = cleanupAsteroid;
window.setAsteroidVelocity = setAsteroidVelocity;

console.log('Ultra-realistic asteroid model loaded!');