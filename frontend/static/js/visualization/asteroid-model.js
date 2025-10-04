// 🪨 Amazing Asteroid Model - Realistic Physics & Animation
console.log('🪨 Loading amazing asteroid model...');

// Asteroid Physics Constants
const ASTEROID_PHYSICS = {
    density: 3000, // kg/m³
    rotationSpeed: 0.02,
    trailLength: 100,
    trailOpacity: 0.6
};

// Global asteroid variables
let asteroidMesh, asteroidTrail, asteroidParticles;
let asteroidPosition = { x: 0, y: 0, z: 3 };
let asteroidVelocity = { x: 0, y: 0, z: -0.1 };
let trailPoints = [];
let isAsteroidAnimating = false;

// Create amazing asteroid with realistic features
function createAmazingAsteroid(diameter = 0.02, position = {x: 0, y: 0, z: 3}) {
    console.log('🪨 Creating amazing asteroid...');
    
    // Remove existing asteroid
    if (asteroidMesh) {
        scene.remove(asteroidMesh);
    }
    
    // Create irregular asteroid geometry
    const asteroidGeometry = createIrregularAsteroidGeometry(diameter);
    
    // Create realistic asteroid material
    const asteroidMaterial = new THREE.MeshPhongMaterial({
        map: createAsteroidTexture(),
        bumpMap: createAsteroidBumpTexture(),
        bumpScale: 0.05,
        shininess: 20,
        specular: new THREE.Color(0x222222),
        emissive: new THREE.Color(0x111111)
    });
    
    // Create asteroid mesh
    asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroidMesh.position.set(position.x, position.y, position.z);
    asteroidMesh.castShadow = true;
    asteroidMesh.receiveShadow = true;
    asteroidMesh.name = 'Asteroid';
    
    // Add to scene
    scene.add(asteroidMesh);
    
    // Create particle system for asteroid
    createAsteroidParticles();
    
    // Create trail
    createAsteroidTrail();
    
    // Start animation
    startAsteroidAnimation();
    
    console.log('✅ Amazing asteroid created!');
    return asteroidMesh;
}

// Create irregular asteroid geometry
function createIrregularAsteroidGeometry(diameter) {
    const geometry = new THREE.SphereGeometry(diameter, 16, 16);
    
    // Add noise to vertices for irregular shape
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const noise = (Math.random() - 0.5) * 0.1;
        vertices[i] += noise;     // x
        vertices[i + 1] += noise; // y
        vertices[i + 2] += noise; // z
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
}

// Create asteroid texture
function createAsteroidTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Base asteroid color
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(0.5, '#A0522D');
    gradient.addColorStop(1, '#654321');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add surface details
    ctx.fillStyle = '#5D4E37';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 20 + 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add craters
    ctx.fillStyle = '#2F1B14';
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 15 + 5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Create asteroid bump texture
function createAsteroidBumpTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create noise pattern
    const imageData = ctx.createImageData(512, 512);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;
        data[i + 1] = noise;
        data[i + 2] = noise;
        data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

// Create asteroid particles
function createAsteroidParticles() {
    if (asteroidParticles) {
        scene.remove(asteroidParticles);
    }
    
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions around asteroid
        positions[i3] = (Math.random() - 0.5) * 0.1;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.1;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        // Dust colors
        colors[i3] = 0.5 + Math.random() * 0.5;
        colors[i3 + 1] = 0.3 + Math.random() * 0.3;
        colors[i3 + 2] = 0.1 + Math.random() * 0.2;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    asteroidParticles = new THREE.Points(geometry, material);
    asteroidParticles.position.copy(asteroidMesh.position);
    scene.add(asteroidParticles);
}

// Create asteroid trail
function createAsteroidTrail() {
    if (asteroidTrail) {
        scene.remove(asteroidTrail);
    }
    
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: ASTEROID_PHYSICS.trailOpacity,
        linewidth: 2
    });
    
    asteroidTrail = new THREE.Line(geometry, material);
    scene.add(asteroidTrail);
}

// Start asteroid animation
function startAsteroidAnimation() {
    isAsteroidAnimating = true;
    
    function animateAsteroid() {
        if (!isAsteroidAnimating || !asteroidMesh) return;
        
        // Rotate asteroid
        asteroidMesh.rotation.x += ASTEROID_PHYSICS.rotationSpeed;
        asteroidMesh.rotation.y += ASTEROID_PHYSICS.rotationSpeed * 0.7;
        asteroidMesh.rotation.z += ASTEROID_PHYSICS.rotationSpeed * 0.3;
        
        // Update position
        asteroidMesh.position.x += asteroidVelocity.x;
        asteroidMesh.position.y += asteroidVelocity.y;
        asteroidMesh.position.z += asteroidVelocity.z;
        
        // Update particles
        if (asteroidParticles) {
            asteroidParticles.position.copy(asteroidMesh.position);
            asteroidParticles.rotation.x += 0.01;
            asteroidParticles.rotation.y += 0.01;
        }
        
        // Update trail
        updateAsteroidTrail();
        
        requestAnimationFrame(animateAsteroid);
    }
    
    animateAsteroid();
}

// Update asteroid trail
function updateAsteroidTrail() {
    if (!asteroidMesh || !asteroidTrail) return;
    
    // Add current position to trail
    trailPoints.push(asteroidMesh.position.clone());
    
    // Limit trail length
    if (trailPoints.length > ASTEROID_PHYSICS.trailLength) {
        trailPoints.shift();
    }
    
    // Update trail geometry
    if (trailPoints.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
        asteroidTrail.geometry.dispose();
        asteroidTrail.geometry = geometry;
    }
}

// Set asteroid velocity
function setAsteroidVelocity(velocity) {
    asteroidVelocity = velocity;
    console.log('🚀 Asteroid velocity set:', velocity);
}

// Simulate asteroid impact
function simulateAsteroidImpact() {
    console.log('💥 Simulating asteroid impact...');
    
    if (!asteroidMesh) return;
    
    // Create impact explosion
    createImpactExplosion();
    
    // Create impact crater
    createImpactCrater();
    
    // Create shockwave
    createShockwave();
    
    // Remove asteroid
    setTimeout(() => {
        if (asteroidMesh) {
            scene.remove(asteroidMesh);
            asteroidMesh = null;
        }
    }, 1000);
}

// Create impact explosion
function createImpactExplosion() {
    const explosionGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4500,
        transparent: true,
        opacity: 0.8
    });
    
    const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosion.position.copy(asteroidMesh.position);
    scene.add(explosion);
    
    // Animate explosion
    let scale = 0.1;
    let opacity = 0.8;
    
    function animateExplosion() {
        scale += 0.05;
        opacity -= 0.02;
        
        explosion.scale.setScalar(scale);
        explosionMaterial.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animateExplosion);
        } else {
            scene.remove(explosion);
        }
    }
    
    animateExplosion();
}

// Create impact crater
function createImpactCrater() {
    const craterGeometry = new THREE.RingGeometry(0.05, 0.2, 32);
    const craterMaterial = new THREE.MeshBasicMaterial({
        color: 0x8B4513,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const crater = new THREE.Mesh(craterGeometry, craterMaterial);
    crater.position.copy(asteroidMesh.position);
    crater.rotation.x = -Math.PI / 2;
    scene.add(crater);
}

// Create shockwave
function createShockwave() {
    const shockwaveGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
    const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    
    const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
    shockwave.position.copy(asteroidMesh.position);
    shockwave.rotation.x = -Math.PI / 2;
    scene.add(shockwave);
    
    // Animate shockwave
    let scale = 1;
    let opacity = 0.5;
    
    function animateShockwave() {
        scale += 0.1;
        opacity -= 0.02;
        
        shockwave.scale.setScalar(scale);
        shockwaveMaterial.opacity = opacity;
        
        if (opacity > 0) {
            requestAnimationFrame(animateShockwave);
        } else {
            scene.remove(shockwave);
        }
    }
    
    animateShockwave();
}

// Stop asteroid animation
function stopAsteroidAnimation() {
    isAsteroidAnimating = false;
}

// Reset asteroid
function resetAsteroid() {
    console.log('🔄 Resetting asteroid...');
    
    stopAsteroidAnimation();
    
    if (asteroidMesh) {
        scene.remove(asteroidMesh);
        asteroidMesh = null;
    }
    
    if (asteroidTrail) {
        scene.remove(asteroidTrail);
        asteroidTrail = null;
    }
    
    if (asteroidParticles) {
        scene.remove(asteroidParticles);
        asteroidParticles = null;
    }
    
    trailPoints = [];
    asteroidPosition = { x: 0, y: 0, z: 3 };
    asteroidVelocity = { x: 0, y: 0, z: -0.1 };
}

// Export functions
window.createAmazingAsteroid = createAmazingAsteroid;
window.setAsteroidVelocity = setAsteroidVelocity;
window.simulateAsteroidImpact = simulateAsteroidImpact;
window.stopAsteroidAnimation = stopAsteroidAnimation;
window.resetAsteroid = resetAsteroid;

console.log('🪨 Asteroid model module loaded!');
