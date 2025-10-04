// 🪨 Home Page Asteroid Viewer - Interactive 3D Asteroid
console.log('🪨 Loading home page asteroid viewer...');

// Asteroid Viewer Configuration
const ASTEROID_VIEWER_CONFIG = {
    containerId: 'threejs-asteroid-container',
    asteroidSize: 1.5,
    cameraDistance: 4,
    rotationSpeed: 0.005,
    craterCount: 80,
    starCount: 1500
};

// Global variables
let asteroidScene, asteroidCamera, asteroidRenderer, homeAsteroidMesh, starfield;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let isDragging = false;
let animationId;

// Initialize the asteroid viewer
function initAsteroidViewer() {
    console.log('🪨 Initializing asteroid viewer for home page...');
    
    const container = document.getElementById(ASTEROID_VIEWER_CONFIG.containerId);
    if (!container) {
        console.error('❌ Asteroid container not found');
        return;
    }

    // Get container dimensions
    const rect = container.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 300;

    // Create scene
    asteroidScene = new THREE.Scene();
    asteroidScene.background = new THREE.Color(0x000011);

    // Create camera
    asteroidCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    asteroidCamera.position.z = ASTEROID_VIEWER_CONFIG.cameraDistance;

    // Create renderer
    asteroidRenderer = new THREE.WebGLRenderer({ antialias: true });
    asteroidRenderer.setSize(width, height);
    asteroidRenderer.shadowMap.enabled = true;
    asteroidRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(asteroidRenderer.domElement);

    // Create asteroid
    createEnhancedAsteroid();

    // Create starfield
    createStarfield();

    // Setup lighting
    setupLighting();

    // Add mouse/touch controls
    setupControls();

    // Start animation
    animate();

    console.log('✅ Asteroid viewer initialized successfully!');
}

// Create enhanced asteroid using the asteroid model from assets
function createEnhancedAsteroid() {
    console.log('🪨 Creating enhanced asteroid for home page...');
    
    // Use the existing asteroid model if available
    if (typeof window.createAmazingAsteroid === 'function') {
        homeAsteroidMesh = window.createAmazingAsteroid(ASTEROID_VIEWER_CONFIG.asteroidSize, {x: 0, y: 0, z: 0});
        asteroidScene.add(homeAsteroidMesh);
        console.log('✅ Enhanced asteroid created using asset model!');
        return;
    }
    
    // Fallback to detailed asteroid
    createDetailedAsteroid();
}

// Create detailed asteroid with realistic features (fallback)
function createDetailedAsteroid() {
    console.log('🪨 Creating detailed asteroid...');

    // Create high-detail sphere geometry
    const geometry = new THREE.SphereGeometry(ASTEROID_VIEWER_CONFIG.asteroidSize, 64, 64);
    
    // Get position attributes for modification
    const positions = geometry.attributes.position;
    const vertexCount = positions.count;

    // Create craters for realistic surface
    const craters = [];
    for (let i = 0; i < ASTEROID_VIEWER_CONFIG.craterCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = ASTEROID_VIEWER_CONFIG.asteroidSize;
        
        craters.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta),
            z: r * Math.cos(phi),
            radius: Math.random() * 0.4 + 0.1,
            depth: Math.random() * 0.08 + 0.03
        });
    }

    // Modify vertices for realistic asteroid shape
    for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        const length = Math.sqrt(x * x + y * y + z * z);
        const nx = x / length;
        const ny = y / length;
        const nz = z / length;
        
        // Create irregular asteroid shape
        const ovalFactorX = 1.2;
        const ovalFactorY = 0.9;
        const ovalFactorZ = 1.1;
        
        // Add organic bulges
        const bulge1 = Math.max(0, Math.sin(nx * 1.8 + 10) * Math.cos(ny * 1.5 + 20)) * 0.08;
        const bulge2 = Math.max(0, Math.sin(ny * 2.0 + 30) * Math.cos(nz * 1.7 + 40)) * 0.06;
        const bulge3 = Math.max(0, Math.sin(nz * 1.6 + 50) * Math.cos(nx * 1.9 + 60)) * 0.05;
        
        let displacement = 1.0 + bulge1 + bulge2 + bulge3;
        
        // Add smooth organic variations
        const smooth1 = Math.sin(x * 1.1 + 15) * Math.cos(y * 1.3 + 20) * 0.03;
        const smooth2 = Math.sin(y * 1.4 + 35) * Math.cos(z * 1.2 + 25) * 0.025;
        const smooth3 = Math.sin(z * 1.0 + 45) * Math.cos(x * 1.4 + 55) * 0.02;
        
        displacement += smooth1 + smooth2 + smooth3;
        
        // Add gentle random variation
        const randomVariation = (Math.random() - 0.5) * 0.02;
        displacement += randomVariation;
        
        // Apply craters
        for (let j = 0; j < craters.length; j++) {
            const crater = craters[j];
            const dx = x - crater.x;
            const dy = y - crater.y;
            const dz = z - crater.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < crater.radius) {
                const craterEffect = 1 - (dist / crater.radius);
                const craterDepth = Math.pow(craterEffect, 3) * crater.depth;
                displacement -= craterDepth;
            }
        }
        
        // Ensure positive displacement
        displacement = Math.max(displacement, 0.8);
        
        // Apply oval transformation
        positions.setXYZ(
            i, 
            nx * displacement * ASTEROID_VIEWER_CONFIG.asteroidSize * ovalFactorX, 
            ny * displacement * ASTEROID_VIEWER_CONFIG.asteroidSize * ovalFactorY, 
            nz * displacement * ASTEROID_VIEWER_CONFIG.asteroidSize * ovalFactorZ
        );
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();

    // Create realistic asteroid material
    const material = new THREE.MeshStandardMaterial({
        color: 0x6a6a6a,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: false
    });

    // Create asteroid mesh
    homeAsteroidMesh = new THREE.Mesh(geometry, material);
    homeAsteroidMesh.castShadow = true;
    homeAsteroidMesh.receiveShadow = true;
    homeAsteroidMesh.name = 'HomeAsteroid';
    asteroidScene.add(homeAsteroidMesh);

    console.log('✅ Detailed asteroid created!');
}

// Create starfield background
function createStarfield() {
    console.log('⭐ Creating starfield...');

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        transparent: true,
        opacity: 0.8
    });

    const starVertices = [];
    for (let i = 0; i < ASTEROID_VIEWER_CONFIG.starCount; i++) {
        const x = (Math.random() - 0.5) * 50;
        const y = (Math.random() - 0.5) * 50;
        const z = (Math.random() - 0.5) * 50;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starfield = new THREE.Points(starGeometry, starMaterial);
    starfield.name = 'HomeStarfield';
    asteroidScene.add(starfield);

    console.log('✅ Starfield created!');
}

// Setup lighting for the asteroid
function setupLighting() {
    console.log('💡 Setting up lighting...');

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    asteroidScene.add(ambientLight);

    // Main directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(4, 2, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    asteroidScene.add(sunLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0x4080ff, 0.3);
    rimLight.position.set(-3, -2, -3);
    asteroidScene.add(rimLight);

    // Back light for atmosphere
    const backLight = new THREE.DirectionalLight(0xff8040, 0.2);
    backLight.position.set(0, 3, -2);
    asteroidScene.add(backLight);

    console.log('✅ Lighting setup complete!');
}

// Setup mouse and touch controls
function setupControls() {
    const canvas = asteroidRenderer.domElement;
    
    // Mouse events
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);
    
    // Touch events
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
}

// Mouse event handlers
function onMouseDown(event) {
    isDragging = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    event.preventDefault();
}

function onMouseMove(event) {
    if (isDragging) {
        const deltaX = event.clientX - mouseX;
        const deltaY = event.clientY - mouseY;
        
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
}

function onMouseUp() {
    isDragging = false;
}

function onWheel(event) {
    asteroidCamera.position.z += event.deltaY * 0.01;
    asteroidCamera.position.z = Math.max(2, Math.min(8, asteroidCamera.position.z));
    event.preventDefault();
}

// Touch event handlers
function onTouchStart(event) {
    if (event.touches.length === 1) {
        isDragging = true;
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
        event.preventDefault();
    }
}

function onTouchMove(event) {
    if (isDragging && event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - mouseX;
        const deltaY = event.touches[0].clientY - mouseY;
        
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        
        mouseX = event.touches[0].clientX;
        mouseY = event.touches[0].clientY;
        event.preventDefault();
    }
}

function onTouchEnd() {
    isDragging = false;
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    // Smooth auto-rotation when not dragging
    if (!isDragging) {
        targetRotationY += ASTEROID_VIEWER_CONFIG.rotationSpeed;
    }
    
    // Apply smooth rotation
    if (homeAsteroidMesh) {
        homeAsteroidMesh.rotation.y += (targetRotationY - homeAsteroidMesh.rotation.y) * 0.1;
        homeAsteroidMesh.rotation.x += (targetRotationX - homeAsteroidMesh.rotation.x) * 0.1;
    }
    
    // Rotate starfield slowly
    if (starfield) {
        starfield.rotation.y += 0.0005;
    }
    
    // Render the scene
    asteroidRenderer.render(asteroidScene, asteroidCamera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById(ASTEROID_VIEWER_CONFIG.containerId);
    if (!container || !asteroidCamera || !asteroidRenderer) return;
    
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    asteroidCamera.aspect = width / height;
    asteroidCamera.updateProjectionMatrix();
    asteroidRenderer.setSize(width, height);
}

// Cleanup function
function destroyAsteroidViewer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (asteroidRenderer && asteroidRenderer.domElement) {
        const container = document.getElementById(ASTEROID_VIEWER_CONFIG.containerId);
        if (container && container.contains(asteroidRenderer.domElement)) {
            container.removeChild(asteroidRenderer.domElement);
        }
    }
    
    // Clean up Three.js objects
    if (asteroidScene) {
        asteroidScene.clear();
    }
    
    asteroidScene = null;
    asteroidCamera = null;
    asteroidRenderer = null;
    homeAsteroidMesh = null;
    starfield = null;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the container to be properly sized
    setTimeout(() => {
        initAsteroidViewer();
    }, 100);
});

// Handle window resize
window.addEventListener('resize', onWindowResize);

// Export functions for external use
window.HomeAsteroidViewer = {
    init: initAsteroidViewer,
    destroy: destroyAsteroidViewer,
    onResize: onWindowResize
};

console.log('🪨 Home asteroid viewer module loaded!');
