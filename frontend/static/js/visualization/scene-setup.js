// 🌍 Amazing 3D Scene Setup - Professional Quality
console.log('🎨 Initializing amazing 3D scene...');

// Global 3D Scene Variables
let scene, camera, renderer, controls;
let earth, asteroid, orbitPath, impactZone;
let ambientLight, directionalLight, pointLight;
let stars, atmosphere;
let animationId;
let isAnimating = false;

// Scene Configuration
const SCENE_CONFIG = {
    earthRadius: 1,
    asteroidRadius: 0.02,
    cameraDistance: 3,
    animationSpeed: 0.01,
    orbitSegments: 128,
    starCount: 2000
};

// Initialize the amazing 3D scene
async function initializeAmazingScene() {
    console.log('🚀 Creating amazing 3D scene...');
    
    try {
        // Get canvas element
        const canvas = document.getElementById('three-canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);

        // Create camera
        camera = new THREE.PerspectiveCamera(
            75, 
            canvas.clientWidth / canvas.clientHeight, 
            0.1, 
            1000
        );
        camera.position.set(0, 0, SCENE_CONFIG.cameraDistance);

        // Create renderer with amazing settings
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Enable amazing rendering features
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.outputEncoding = THREE.sRGBEncoding;

        // Add amazing lighting
        setupAmazingLighting();

        // Create amazing Earth
        await createAmazingEarth();

        // Create star field
        createAmazingStarField();

        // Create atmosphere
        createAmazingAtmosphere();

        // Add orbit controls
        setupOrbitControls();

        // Start animation loop
        startAmazingAnimation();

        // Handle window resize
        window.addEventListener('resize', onWindowResize);

        console.log('✅ Amazing 3D scene initialized successfully!');
        
        // Update global state
        if (window.AppState) {
            window.AppState.threeScene = scene;
            window.AppState.camera = camera;
            window.AppState.renderer = renderer;
            window.AppState.earth = earth;
        }

    } catch (error) {
        console.error('❌ Failed to initialize 3D scene:', error);
        showSceneError('Failed to initialize 3D scene. Please refresh the page.');
    }
}

// Setup amazing lighting system
function setupAmazingLighting() {
    console.log('💡 Setting up amazing lighting...');
    
    // Ambient light for overall illumination
    ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Main directional light (sun)
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);

    // Point light for dramatic effect
    pointLight = new THREE.PointLight(0x00aaff, 0.5, 10);
    pointLight.position.set(2, 1, 2);
    scene.add(pointLight);
}

// Create amazing Earth with realistic textures
async function createAmazingEarth() {
    console.log('🌍 Creating amazing Earth...');
    
    // Earth geometry
    const earthGeometry = new THREE.SphereGeometry(SCENE_CONFIG.earthRadius, 64, 64);
    
    // Create amazing Earth material
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: createEarthTexture(),
        bumpMap: createBumpTexture(),
        bumpScale: 0.1,
        shininess: 100,
        specular: new THREE.Color(0x222222)
    });

    // Create Earth mesh
    earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.castShadow = true;
    earth.receiveShadow = true;
    earth.name = 'Earth';
    scene.add(earth);

    // Add Earth rotation animation
    animateEarthRotation();

    console.log('✅ Amazing Earth created!');
}

// Create Earth texture (procedural)
function createEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create base Earth colors
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(0.3, '#2a5298');
    gradient.addColorStop(0.7, '#4a90e2');
    gradient.addColorStop(1, '#87ceeb');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Add continents (simplified)
    ctx.fillStyle = '#228b22';
    ctx.beginPath();
    ctx.arc(200, 200, 80, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(800, 300, 60, 0, Math.PI * 2);
    ctx.fill();

    // Add clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const size = Math.random() * 30 + 10;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

// Create bump texture for Earth
function createBumpTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create noise pattern for terrain
    const imageData = ctx.createImageData(1024, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        data[i] = noise;     // R
        data[i + 1] = noise; // G
        data[i + 2] = noise; // B
        data[i + 3] = 255;  // A
    }

    ctx.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
}

// Create amazing star field
function createAmazingStarField() {
    console.log('⭐ Creating amazing star field...');
    
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];

    for (let i = 0; i < SCENE_CONFIG.starCount; i++) {
        // Random position on sphere
        const radius = 50 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        starPositions.push(x, y, z);

        // Random star colors
        const color = new THREE.Color();
        color.setHSL(0.6 + Math.random() * 0.4, 0.5, 0.5 + Math.random() * 0.5);
        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    console.log('✅ Amazing star field created!');
}

// Create amazing atmosphere
function createAmazingAtmosphere() {
    console.log('🌫️ Creating amazing atmosphere...');
    
    const atmosphereGeometry = new THREE.SphereGeometry(SCENE_CONFIG.earthRadius * 1.05, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });

    atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
}

// Setup orbit controls
function setupOrbitControls() {
    // Note: OrbitControls would be imported from CDN
    // For now, we'll implement basic mouse controls
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    let rotationX = 0, rotationY = 0;

    const canvas = document.getElementById('three-canvas');
    
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / rect.width;
        mouseY = (event.clientY - rect.top) / rect.height;
        
        targetRotationY = (mouseX - 0.5) * Math.PI;
        targetRotationX = (mouseY - 0.5) * Math.PI * 0.5;
    });

    // Smooth camera movement
    function updateCamera() {
        rotationX += (targetRotationX - rotationX) * 0.05;
        rotationY += (targetRotationY - rotationY) * 0.05;
        
        camera.position.x = Math.sin(rotationY) * Math.cos(rotationX) * SCENE_CONFIG.cameraDistance;
        camera.position.y = Math.sin(rotationX) * SCENE_CONFIG.cameraDistance;
        camera.position.z = Math.cos(rotationY) * Math.cos(rotationX) * SCENE_CONFIG.cameraDistance;
        
        camera.lookAt(0, 0, 0);
    }

    // Store update function for animation loop
    window.updateCamera = updateCamera;
}

// Start amazing animation loop
function startAmazingAnimation() {
    console.log('🎬 Starting amazing animation...');
    
    isAnimating = true;
    
    function animate() {
        if (!isAnimating) return;
        
        animationId = requestAnimationFrame(animate);
        
        // Update camera
        if (window.updateCamera) {
            window.updateCamera();
        }
        
        // Rotate Earth
        if (earth) {
            earth.rotation.y += SCENE_CONFIG.animationSpeed;
        }
        
        // Rotate stars slowly
        if (stars) {
            stars.rotation.y += SCENE_CONFIG.animationSpeed * 0.1;
        }
        
        // Rotate atmosphere
        if (atmosphere) {
            atmosphere.rotation.y += SCENE_CONFIG.animationSpeed * 0.5;
        }
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    animate();
    console.log('✅ Amazing animation started!');
}

// Stop animation
function stopAnimation() {
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
}

// Handle window resize
function onWindowResize() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || !camera || !renderer) return;
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Animate Earth rotation
function animateEarthRotation() {
    if (!earth) return;
    
    function rotate() {
        earth.rotation.y += SCENE_CONFIG.animationSpeed;
        requestAnimationFrame(rotate);
    }
    rotate();
}

// Create asteroid
function createAsteroid(diameter = 0.02, position = {x: 0, y: 0, z: 2}) {
    console.log('🪨 Creating asteroid...');
    
    // Remove existing asteroid
    if (asteroid) {
        scene.remove(asteroid);
    }
    
    const asteroidGeometry = new THREE.SphereGeometry(diameter, 16, 16);
    const asteroidMaterial = new THREE.MeshPhongMaterial({
        color: 0x8B4513,
        shininess: 30,
        specular: new THREE.Color(0x444444)
    });
    
    asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(position.x, position.y, position.z);
    asteroid.castShadow = true;
    asteroid.name = 'Asteroid';
    scene.add(asteroid);
    
    console.log('✅ Asteroid created!');
    return asteroid;
}

// Create orbit path
function createOrbitPath(points) {
    console.log('🛤️ Creating orbit path...');
    
    // Remove existing orbit path
    if (orbitPath) {
        scene.remove(orbitPath);
    }
    
    if (!points || points.length < 2) return;
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xff6b35,
        linewidth: 2,
        transparent: true,
        opacity: 0.8
    });
    
    orbitPath = new THREE.Line(geometry, material);
    scene.add(orbitPath);
    
    console.log('✅ Orbit path created!');
}

// Create impact zone
function createImpactZone(radius, position) {
    console.log('💥 Creating impact zone...');
    
    // Remove existing impact zone
    if (impactZone) {
        scene.remove(impactZone);
    }
    
    const zoneGeometry = new THREE.RingGeometry(radius * 0.8, radius, 32);
    const zoneMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4757,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    impactZone = new THREE.Mesh(zoneGeometry, zoneMaterial);
    impactZone.position.copy(position);
    impactZone.rotation.x = -Math.PI / 2;
    scene.add(impactZone);
    
    console.log('✅ Impact zone created!');
}

// Show scene error
function showSceneError(message) {
    const canvas = document.getElementById('three-canvas');
    if (canvas) {
        canvas.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100%; 
                color: #ff4757; 
                font-size: 1.2rem;
                text-align: center;
                padding: 2rem;
                background: rgba(0,0,0,0.8);
            ">
                <div>
                    <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                    <div>${message}</div>
                </div>
            </div>
        `;
    }
}

// Export functions for global use
window.initializeAmazingScene = initializeAmazingScene;
window.createAsteroid = createAsteroid;
window.createOrbitPath = createOrbitPath;
window.createImpactZone = createImpactZone;
window.stopAnimation = stopAnimation;

console.log('🎨 Scene setup module loaded!');
