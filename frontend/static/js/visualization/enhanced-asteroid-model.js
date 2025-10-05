// Enhanced Asteroid Model with Realistic Physics and Animations
console.log('🪨 Loading enhanced asteroid model...');

// Asteroid Physics Configuration
const ASTEROID_PHYSICS = {
    density: 3000, // kg/m³
    rotationSpeed: 0.02,
    trailLength: 100,
    trailOpacity: 0.6,
    particleCount: 200,
    debrisCount: 50
};

// Global asteroid variables
let asteroidMesh, asteroidTrail, asteroidParticles, asteroidDebris;
let asteroidGroup, asteroidPhysics, asteroidTrail;
let isAsteroidAnimating = false;
let asteroidTrailPoints = [];

// Enhanced asteroid physics state
let asteroidState = {
    position: { x: 0, y: 0, z: 3 },
    velocity: { x: 0, y: 0, z: -0.1 },
    angularVelocity: { x: 0.01, y: 0.02, z: 0.005 },
    mass: 1e12, // kg
    temperature: 200, // Kelvin
    stress: 0, // Internal stress
    fragmentation: 0 // Fragmentation level
};

// Create enhanced asteroid with realistic physics
function createEnhancedAsteroid(diameter = 0.02, position = {x: 0, y: 0, z: 3}) {
    console.log('🪨 Creating enhanced asteroid...');
    
    // Remove existing asteroid
    if (asteroidGroup) {
        scene.remove(asteroidGroup);
    }
    
    // Create asteroid group
    asteroidGroup = new THREE.Group();
    asteroidGroup.name = 'AsteroidGroup';
    
    // Create irregular asteroid geometry
    const asteroidGeometry = createIrregularAsteroidGeometry(diameter);
    
    // Create realistic asteroid material
    const asteroidMaterial = new THREE.MeshPhongMaterial({
        map: createAsteroidTexture(),
        bumpMap: createAsteroidBumpMap(),
        bumpScale: 0.1,
        shininess: 5,
        specular: new THREE.Color(0x111111),
        emissive: new THREE.Color(0x220000),
        emissiveIntensity: 0.1
    });
    
    // Create asteroid mesh
    asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroidMesh.position.set(position.x, position.y, position.z);
    asteroidMesh.castShadow = true;
    asteroidMesh.receiveShadow = true;
    asteroidMesh.name = 'Asteroid';
    
    // Add to group
    asteroidGroup.add(asteroidMesh);
    
    // Create particle system
    createAsteroidParticleSystem();
    
    // Create debris field
    createAsteroidDebrisField();
    
    // Create trail
    createAsteroidTrail();
    
    // Initialize physics
    initializeAsteroidPhysics(diameter);
    
    // Add to scene
    scene.add(asteroidGroup);
    
    // Start animation
    startAsteroidAnimation();
    
    console.log('✅ Enhanced asteroid created!');
    return asteroidGroup;
}

// Create irregular asteroid geometry
function createIrregularAsteroidGeometry(diameter) {
    const geometry = new THREE.SphereGeometry(diameter, 16, 16);
    
    // Add noise to vertices for irregular shape
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const noise = (Math.random() - 0.5) * 0.2;
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
    
    // Create base asteroid color
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#8B4513'); // Brown center
    gradient.addColorStop(0.7, '#A0522D'); // Saddle brown
    gradient.addColorStop(1, '#654321'); // Dark brown edges
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add surface features
    ctx.fillStyle = '#2F1B14';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 10 + 5;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
}

// Create asteroid bump map
function createAsteroidBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create surface roughness
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // Red
        data[i + 1] = noise; // Green
        data[i + 2] = noise; // Blue
        data[i + 3] = 255;   // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return texture;
}

// Create asteroid particle system
function createAsteroidParticleSystem() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = ASTEROID_PHYSICS.particleCount;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions around asteroid
        positions[i3] = (Math.random() - 0.5) * 0.1;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.1;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        // Dust colors
        colors[i3] = 0.8;     // Red
        colors[i3 + 1] = 0.6; // Green
        colors[i3 + 2] = 0.4; // Blue
        
        // Random sizes
        sizes[i] = Math.random() * 0.01 + 0.005;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        sizeAttenuation: true,
        alphaTest: 0.1,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    asteroidParticles = new THREE.Points(particleGeometry, particleMaterial);
    asteroidParticles.name = 'AsteroidParticles';
    asteroidGroup.add(asteroidParticles);
}

// Create asteroid debris field
function createAsteroidDebrisField() {
    const debrisGeometry = new THREE.BufferGeometry();
    const debrisCount = ASTEROID_PHYSICS.debrisCount;
    const positions = new Float32Array(debrisCount * 3);
    const colors = new Float32Array(debrisCount * 3);
    const sizes = new Float32Array(debrisCount);
    
    for (let i = 0; i < debrisCount; i++) {
        const i3 = i * 3;
        
        // Random positions around asteroid
        positions[i3] = (Math.random() - 0.5) * 0.2;
        positions[i3 + 1] = (Math.random() - 0.5) * 0.2;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
        
        // Debris colors
        colors[i3] = 0.6;     // Red
        colors[i3 + 1] = 0.4; // Green
        colors[i3 + 2] = 0.2; // Blue
        
        // Random sizes
        sizes[i] = Math.random() * 0.02 + 0.01;
    }
    
    debrisGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    debrisGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    debrisGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const debrisMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        sizeAttenuation: true,
        alphaTest: 0.1,
        opacity: 0.8
    });
    
    asteroidDebris = new THREE.Points(debrisGeometry, debrisMaterial);
    asteroidDebris.name = 'AsteroidDebris';
    asteroidGroup.add(asteroidDebris);
}

// Create asteroid trail
function createAsteroidTrail() {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({
        color: 0xff6b35,
        transparent: true,
        opacity: 0.6,
        linewidth: 2
    });
    
    asteroidTrail = new THREE.Line(trailGeometry, trailMaterial);
    asteroidTrail.name = 'AsteroidTrail';
    scene.add(asteroidTrail);
}

// Initialize asteroid physics
function initializeAsteroidPhysics(diameter) {
    asteroidPhysics = {
        mass: calculateAsteroidMass(diameter),
        velocity: asteroidState.velocity,
        angularVelocity: asteroidState.angularVelocity,
        temperature: asteroidState.temperature,
        stress: asteroidState.stress,
        fragmentation: asteroidState.fragmentation
    };
}

// Calculate asteroid mass
function calculateAsteroidMass(diameter) {
    const radius = diameter / 2;
    const volume = (4/3) * Math.PI * Math.pow(radius, 3);
    return volume * ASTEROID_PHYSICS.density;
}

// Start asteroid animation
function startAsteroidAnimation() {
    isAsteroidAnimating = true;
    animateAsteroid();
}

// Animate asteroid
function animateAsteroid() {
    if (!isAsteroidAnimating || !asteroidGroup) return;
    
    // Update position
    updateAsteroidPosition();
    
    // Update rotation
    updateAsteroidRotation();
    
    // Update particles
    updateAsteroidParticles();
    
    // Update trail
    updateAsteroidTrail();
    
    // Update physics
    updateAsteroidPhysics();
    
    // Continue animation
    requestAnimationFrame(animateAsteroid);
}

// Update asteroid position
function updateAsteroidPosition() {
    if (!asteroidGroup) return;
    
    // Update position based on velocity
    asteroidGroup.position.x += asteroidState.velocity.x;
    asteroidGroup.position.y += asteroidState.velocity.y;
    asteroidGroup.position.z += asteroidState.velocity.z;
    
    // Update state
    asteroidState.position.x = asteroidGroup.position.x;
    asteroidState.position.y = asteroidGroup.position.y;
    asteroidState.position.z = asteroidGroup.position.z;
}

// Update asteroid rotation
function updateAsteroidRotation() {
    if (!asteroidMesh) return;
    
    // Rotate asteroid
    asteroidMesh.rotation.x += asteroidState.angularVelocity.x;
    asteroidMesh.rotation.y += asteroidState.angularVelocity.y;
    asteroidMesh.rotation.z += asteroidState.angularVelocity.z;
    
    // Rotate particles
    if (asteroidParticles) {
        asteroidParticles.rotation.x += asteroidState.angularVelocity.x * 0.5;
        asteroidParticles.rotation.y += asteroidState.angularVelocity.y * 0.5;
        asteroidParticles.rotation.z += asteroidState.angularVelocity.z * 0.5;
    }
}

// Update asteroid particles
function updateAsteroidParticles() {
    if (!asteroidParticles) return;
    
    const positions = asteroidParticles.geometry.attributes.position.array;
    const colors = asteroidParticles.geometry.attributes.color.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        // Add some movement to particles
        positions[i] += (Math.random() - 0.5) * 0.001;
        positions[i + 1] += (Math.random() - 0.5) * 0.001;
        positions[i + 2] += (Math.random() - 0.5) * 0.001;
        
        // Update colors based on temperature
        const tempFactor = asteroidState.temperature / 1000;
        colors[i] = 0.8 + tempFactor * 0.2;     // Red
        colors[i + 1] = 0.6 - tempFactor * 0.2; // Green
        colors[i + 2] = 0.4 - tempFactor * 0.2; // Blue
    }
    
    asteroidParticles.geometry.attributes.position.needsUpdate = true;
    asteroidParticles.geometry.attributes.color.needsUpdate = true;
}

// Update asteroid trail
function updateAsteroidTrail() {
    if (!asteroidTrail || !asteroidGroup) return;
    
    // Add current position to trail
    asteroidTrailPoints.push({
        x: asteroidGroup.position.x,
        y: asteroidGroup.position.y,
        z: asteroidGroup.position.z
    });
    
    // Limit trail length
    if (asteroidTrailPoints.length > ASTEROID_PHYSICS.trailLength) {
        asteroidTrailPoints.shift();
    }
    
    // Update trail geometry
    if (asteroidTrailPoints.length > 1) {
        const positions = new Float32Array(asteroidTrailPoints.length * 3);
        for (let i = 0; i < asteroidTrailPoints.length; i++) {
            positions[i * 3] = asteroidTrailPoints[i].x;
            positions[i * 3 + 1] = asteroidTrailPoints[i].y;
            positions[i * 3 + 2] = asteroidTrailPoints[i].z;
        }
        
        asteroidTrail.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        asteroidTrail.geometry.attributes.position.needsUpdate = true;
    }
}

// Update asteroid physics
function updateAsteroidPhysics() {
    // Update temperature based on velocity
    const velocityMagnitude = Math.sqrt(
        asteroidState.velocity.x ** 2 + 
        asteroidState.velocity.y ** 2 + 
        asteroidState.velocity.z ** 2
    );
    
    asteroidState.temperature = 200 + velocityMagnitude * 100;
    
    // Update stress based on velocity and rotation
    const angularMagnitude = Math.sqrt(
        asteroidState.angularVelocity.x ** 2 + 
        asteroidState.angularVelocity.y ** 2 + 
        asteroidState.angularVelocity.z ** 2
    );
    
    asteroidState.stress = velocityMagnitude * 0.1 + angularMagnitude * 0.05;
    
    // Update fragmentation based on stress
    if (asteroidState.stress > 0.5) {
        asteroidState.fragmentation += 0.01;
    }
}

// Set asteroid velocity
function setAsteroidVelocity(velocity) {
    asteroidState.velocity = velocity;
}

// Set asteroid position
function setAsteroidPosition(position) {
    asteroidState.position = position;
    if (asteroidGroup) {
        asteroidGroup.position.set(position.x, position.y, position.z);
    }
}

// Get asteroid state
function getAsteroidState() {
    return {
        position: asteroidState.position,
        velocity: asteroidState.velocity,
        angularVelocity: asteroidState.angularVelocity,
        mass: asteroidPhysics.mass,
        temperature: asteroidState.temperature,
        stress: asteroidState.stress,
        fragmentation: asteroidState.fragmentation
    };
}

// Stop asteroid animation
function stopAsteroidAnimation() {
    isAsteroidAnimating = false;
}

// Remove asteroid
function removeAsteroid() {
    if (asteroidGroup) {
        scene.remove(asteroidGroup);
        asteroidGroup = null;
    }
    
    if (asteroidTrail) {
        scene.remove(asteroidTrail);
        asteroidTrail = null;
    }
    
    isAsteroidAnimating = false;
    asteroidTrailPoints = [];
}

// Export functions for use in other modules
window.AsteroidModel = {
    createEnhancedAsteroid,
    setAsteroidVelocity,
    setAsteroidPosition,
    getAsteroidState,
    stopAsteroidAnimation,
    removeAsteroid
};
