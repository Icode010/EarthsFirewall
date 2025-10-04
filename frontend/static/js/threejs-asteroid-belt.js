// Hyper-Realistic 4K Asteroid Belt with Three.js
console.log('🪨 Loading hyper-realistic Three.js asteroid belt...');

// Global variables
let scene, camera, renderer, asteroidBelt;
let asteroids = [];
let animationId;
let container;

// Asteroid configuration
const ASTEROID_CONFIG = {
    count: 25, // Reduced for better performance and spread
    minSize: 0.5,
    maxSize: 3.0,
    spreadRadius: 200,
    animationSpeed: 0.002,
    rotationSpeed: 0.01
};

// Initialize the asteroid belt
function initializeThreeJSAsteroidBelt() {
    console.log('🪨 Initializing Three.js asteroid belt...');
    
    // Get container
    container = document.getElementById('threejs-asteroid-container');
    if (!container) {
        console.error('❌ Asteroid container not found!');
        return;
    }
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011);
    
    // Create camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 50);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to 2x for performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    
    container.appendChild(renderer.domElement);
    
    // Add lighting
    setupLighting();
    
    // Create asteroid belt
    createAsteroidBelt();
    
    // Start animation
    animate();
    
    // Handle resize
    window.addEventListener('resize', onWindowResize);
    
    console.log('✅ Three.js asteroid belt initialized!');
}

// Setup realistic lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);
    
    // Point light for dramatic effect
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 200);
    pointLight.position.set(-50, -50, 30);
    scene.add(pointLight);
}

// Create hyper-realistic asteroid belt
function createAsteroidBelt() {
    asteroidBelt = new THREE.Group();
    
    for (let i = 0; i < ASTEROID_CONFIG.count; i++) {
        const asteroid = createHyperRealisticAsteroid();
        
        // Spread asteroids across the zone (not clustered)
        const angle = (i / ASTEROID_CONFIG.count) * Math.PI * 2;
        const radius = ASTEROID_CONFIG.spreadRadius * (0.3 + Math.random() * 0.7);
        const height = (Math.random() - 0.5) * 50;
        
        asteroid.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // Random rotation
        asteroid.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        // Store rotation speed
        asteroid.userData = {
            rotationSpeed: {
                x: (Math.random() - 0.5) * ASTEROID_CONFIG.rotationSpeed,
                y: (Math.random() - 0.5) * ASTEROID_CONFIG.rotationSpeed,
                z: (Math.random() - 0.5) * ASTEROID_CONFIG.rotationSpeed
            },
            orbitSpeed: (Math.random() - 0.5) * ASTEROID_CONFIG.animationSpeed,
            orbitRadius: radius,
            orbitAngle: angle
        };
        
        asteroidBelt.add(asteroid);
        asteroids.push(asteroid);
    }
    
    scene.add(asteroidBelt);
}

// Create hyper-realistic asteroid
function createHyperRealisticAsteroid() {
    const size = ASTEROID_CONFIG.minSize + Math.random() * (ASTEROID_CONFIG.maxSize - ASTEROID_CONFIG.minSize);
    
    // Create irregular geometry
    const geometry = createIrregularAsteroidGeometry(size);
    
    // Create realistic material
    const material = createRealisticAsteroidMaterial();
    
    const asteroid = new THREE.Mesh(geometry, material);
    asteroid.castShadow = true;
    asteroid.receiveShadow = true;
    
    return asteroid;
}

// Create irregular asteroid geometry
function createIrregularAsteroidGeometry(size) {
    const geometry = new THREE.SphereGeometry(size, 8, 6);
    
    // Make it irregular by modifying vertices
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        const z = positions[i + 2];
        
        // Add random noise to make it irregular
        const noise = 0.3;
        positions[i] += (Math.random() - 0.5) * noise;
        positions[i + 1] += (Math.random() - 0.5) * noise;
        positions[i + 2] += (Math.random() - 0.5) * noise;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    return geometry;
}

// Create realistic asteroid material
function createRealisticAsteroidMaterial() {
    // Base color variations
    const colors = [
        0x8B4513, // Saddle Brown
        0xA0522D, // Sienna
        0x654321, // Dark Brown
        0x2F1B14, // Very Dark Brown
        0x3C2414, // Dark Sienna
        0x5D4E37, // Dark Olive
        0x4A4A4A  // Dark Gray
    ];
    
    const baseColor = colors[Math.floor(Math.random() * colors.length)];
    
    const material = new THREE.MeshPhongMaterial({
        color: baseColor,
        shininess: 10,
        specular: 0x111111,
        transparent: false,
        side: THREE.DoubleSide
    });
    
    // Add some surface variation
    material.color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
    
    return material;
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Rotate individual asteroids
    asteroids.forEach(asteroid => {
        const userData = asteroid.userData;
        asteroid.rotation.x += userData.rotationSpeed.x;
        asteroid.rotation.y += userData.rotationSpeed.y;
        asteroid.rotation.z += userData.rotationSpeed.z;
        
        // Slow orbital motion
        userData.orbitAngle += userData.orbitSpeed;
        asteroid.position.x = Math.cos(userData.orbitAngle) * userData.orbitRadius;
        asteroid.position.z = Math.sin(userData.orbitAngle) * userData.orbitRadius;
    });
    
    // Rotate the entire belt slowly
    asteroidBelt.rotation.y += 0.001;
    
    // Render
    renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Clean up
function destroyThreeJSAsteroidBelt() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    if (scene) {
        scene.clear();
    }
    
    window.removeEventListener('resize', onWindowResize);
    
    if (container && container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on home page
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
        setTimeout(initializeThreeJSAsteroidBelt, 1000);
    }
});

// Export functions
window.ThreeJSAsteroidBelt = {
    initialize: initializeThreeJSAsteroidBelt,
    destroy: destroyThreeJSAsteroidBelt
};
