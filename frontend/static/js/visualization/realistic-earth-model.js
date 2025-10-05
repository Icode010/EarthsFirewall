// 🌍 Realistic Earth Model - Enhanced from GitHub 3D-Earth repository
// High-quality 3D Earth with realistic textures, rotating clouds, and city lights

console.log('🌍 Loading Realistic Earth Model...');

// Earth Configuration
const REALISTIC_EARTH_CONFIG = {
    radius: 1.0,
    segments: 64, // High resolution for realistic appearance
    cloudRadius: 1.01, // Slightly larger than Earth for cloud layer
    atmosphereRadius: 1.05, // Atmospheric glow layer
    tiltAngle: 23.4, // Earth's axial tilt in degrees
    rotationSpeed: 0.001, // Earth surface rotation speed
    cloudRotationSpeed: 0.0015, // Clouds rotate faster for wind effect
    atmosphereRotationSpeed: 0.0005, // Atmosphere rotates slower
    lightingIntensity: 1.2,
    ambientLightIntensity: 0.3
};

// Texture paths - using high-quality Earth textures
const TEXTURE_PATHS = {
    earth: '/static/assets/images/earthmap.jpg',
    clouds: '/static/assets/images/cloud_combined.jpg',
    lights: '/static/assets/images/earth_lights.png',
    normal: '/static/assets/images/earth_normal.jpg',
    specular: '/static/assets/images/earth_specular.jpg'
};

// Create realistic Earth model
function createRealisticEarthModel(scene, position = { x: 0, y: 0, z: 0 }) {
    console.log('Creating realistic Earth model...');
    
    const earthGroup = new THREE.Group();
    earthGroup.position.set(position.x, position.y, position.z);
    earthGroup.name = 'RealisticEarth';
    
    // Create Earth sphere with high resolution
    const earthGeometry = new THREE.SphereGeometry(
        REALISTIC_EARTH_CONFIG.radius, 
        REALISTIC_EARTH_CONFIG.segments, 
        REALISTIC_EARTH_CONFIG.segments
    );
    
    // Create Earth material with multiple textures
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: loadTexture(TEXTURE_PATHS.earth),
        normalMap: loadTexture(TEXTURE_PATHS.normal),
        specularMap: loadTexture(TEXTURE_PATHS.specular),
        normalScale: new THREE.Vector2(0.3, 0.3),
        shininess: 30,
        transparent: false,
        alphaTest: 0
    });
    
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.name = 'Earth';
    earthMesh.castShadow = true;
    earthMesh.receiveShadow = true;
    
    // Apply Earth's axial tilt (flipped to correct orientation)
    earthMesh.rotation.x = THREE.MathUtils.degToRad(REALISTIC_EARTH_CONFIG.tiltAngle + 180);
    
    earthGroup.add(earthMesh);
    
    // Create cloud layer
    const cloudGeometry = new THREE.SphereGeometry(
        REALISTIC_EARTH_CONFIG.cloudRadius, 
        REALISTIC_EARTH_CONFIG.segments, 
        REALISTIC_EARTH_CONFIG.segments
    );
    
    const cloudMaterial = new THREE.MeshPhongMaterial({
        map: loadTexture(TEXTURE_PATHS.clouds),
        transparent: true,
        opacity: 0.8,
        alphaTest: 0.1,
        blending: THREE.AdditiveBlending
    });
    
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.name = 'Clouds';
    cloudMesh.rotation.x = THREE.MathUtils.degToRad(REALISTIC_EARTH_CONFIG.tiltAngle + 180);
    
    earthGroup.add(cloudMesh);
    
    // Create city lights layer
    const lightsGeometry = new THREE.SphereGeometry(
        REALISTIC_EARTH_CONFIG.radius, 
        REALISTIC_EARTH_CONFIG.segments, 
        REALISTIC_EARTH_CONFIG.segments
    );
    
    const lightsMaterial = new THREE.MeshBasicMaterial({
        map: loadTexture(TEXTURE_PATHS.lights),
        transparent: true,
        opacity: 0.9,
        alphaTest: 0.1,
        blending: THREE.AdditiveBlending
    });
    
    const lightsMesh = new THREE.Mesh(lightsGeometry, lightsMaterial);
    lightsMesh.name = 'CityLights';
    lightsMesh.rotation.x = THREE.MathUtils.degToRad(REALISTIC_EARTH_CONFIG.tiltAngle + 180);
    
    earthGroup.add(lightsMesh);
    
    // Create atmospheric glow
    const atmosphereGeometry = new THREE.SphereGeometry(
        REALISTIC_EARTH_CONFIG.atmosphereRadius, 
        32, 
        32
    );
    
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x3ABEF9,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
    });
    
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereMesh.name = 'Atmosphere';
    
    earthGroup.add(atmosphereMesh);
    
    // Store references for animation
    earthGroup.userData = {
        earth: earthMesh,
        clouds: cloudMesh,
        lights: lightsMesh,
        atmosphere: atmosphereMesh,
        rotationSpeed: REALISTIC_EARTH_CONFIG.rotationSpeed,
        cloudRotationSpeed: REALISTIC_EARTH_CONFIG.cloudRotationSpeed,
        atmosphereRotationSpeed: REALISTIC_EARTH_CONFIG.atmosphereRotationSpeed
    };
    
    console.log('Realistic Earth model created successfully');
    return earthGroup;
}

// Enhanced texture loader with error handling
function loadTexture(path) {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
        path,
        (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.flipY = false;
            console.log(`✅ Texture loaded: ${path}`);
        },
        undefined,
        (error) => {
            console.error(`❌ Failed to load texture: ${path}`, error);
        }
    );
    
    return texture;
}

// Animation controller for realistic Earth
class RealisticEarthAnimationController {
    constructor(earthGroup) {
        this.earthGroup = earthGroup;
        this.isAnimating = false;
        this.animationId = null;
    }
    
    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        console.log('Starting realistic Earth animation...');
        this.animate();
    }
    
    stopAnimation() {
        this.isAnimating = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        console.log('Stopped realistic Earth animation');
    }
    
    animate() {
        if (!this.isAnimating || !this.earthGroup) return;
        
        const userData = this.earthGroup.userData;
        
        // Rotate Earth surface
        if (userData.earth) {
            userData.earth.rotation.y += userData.rotationSpeed;
        }
        
        // Rotate clouds at different speed
        if (userData.clouds) {
            userData.clouds.rotation.y += userData.cloudRotationSpeed;
        }
        
        // Rotate city lights with Earth
        if (userData.lights) {
            userData.lights.rotation.y += userData.rotationSpeed;
        }
        
        // Rotate atmosphere slowly
        if (userData.atmosphere) {
            userData.atmosphere.rotation.y += userData.atmosphereRotationSpeed;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setRotationSpeed(speedMultiplier = 1.0) {
        if (this.earthGroup && this.earthGroup.userData) {
            this.earthGroup.userData.rotationSpeed = REALISTIC_EARTH_CONFIG.rotationSpeed * speedMultiplier;
            this.earthGroup.userData.cloudRotationSpeed = REALISTIC_EARTH_CONFIG.cloudRotationSpeed * speedMultiplier;
            this.earthGroup.userData.atmosphereRotationSpeed = REALISTIC_EARTH_CONFIG.atmosphereRotationSpeed * speedMultiplier;
        }
    }
    
    getEarthComponents() {
        if (!this.earthGroup || !this.earthGroup.userData) return null;
        
        return {
            earth: this.earthGroup.userData.earth,
            clouds: this.earthGroup.userData.clouds,
            lights: this.earthGroup.userData.lights,
            atmosphere: this.earthGroup.userData.atmosphere
        };
    }
}

// Enhanced lighting setup for realistic Earth
function createRealisticLighting(scene) {
    console.log('Creating realistic lighting for Earth...');
    
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(
        0x404040, 
        REALISTIC_EARTH_CONFIG.ambientLightIntensity
    );
    ambientLight.name = 'AmbientLight';
    scene.add(ambientLight);
    
    // Main sun light (directional light)
    const sunLight = new THREE.DirectionalLight(
        0xffffff, 
        REALISTIC_EARTH_CONFIG.lightingIntensity
    );
    sunLight.position.set(5, 3, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -10;
    sunLight.shadow.camera.right = 10;
    sunLight.shadow.camera.top = 10;
    sunLight.shadow.camera.bottom = -10;
    sunLight.name = 'SunLight';
    scene.add(sunLight);
    
    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0xffa040, 0.2);
    rimLight.position.set(-3, 6, -5);
    rimLight.name = 'RimLight';
    scene.add(rimLight);
    
    // Fill light for shadows
    const fillLight = new THREE.DirectionalLight(0x4060ff, 0.15);
    fillLight.position.set(-5, -2, -4);
    fillLight.name = 'FillLight';
    scene.add(fillLight);
    
    console.log('Realistic lighting setup complete');
}

// Enhanced camera controls for Earth interaction with auto-scaling
function createEarthCameraControls(camera, renderer, earthGroup) {
    console.log('Creating enhanced Earth camera controls with auto-scaling...');
    
    let ControlsClass = null;
    if (typeof OrbitControls !== 'undefined') {
        ControlsClass = OrbitControls;
    } else if (typeof THREE.OrbitControls !== 'undefined') {
        ControlsClass = THREE.OrbitControls;
    }
    
    if (!ControlsClass) {
        console.error('OrbitControls not available');
        return null;
    }
    
    // Ensure we have a valid DOM element - restrict to canvas only
    const domElement = renderer.domElement;
    if (!domElement) {
        console.error('Renderer DOM element not available for controls');
        return null;
    }
    const controls = new ControlsClass(camera, domElement);
    
    // Enhanced settings for Earth viewing
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;      // ✅ Mouse scroll zoom enabled
    controls.enablePan = true;       // ✅ Right-click pan enabled  
    controls.enableRotate = true;    // ✅ Left-click drag rotate enabled
    controls.autoRotate = false;     // ✅ Earth stays stationary, POV changes
    
    // Camera limits for optimal Earth viewing
    controls.maxDistance = 50; // Can zoom out far to see full trajectory
    controls.minDistance = 1.0; // Can get very close to Earth surface
    controls.maxPolarAngle = Math.PI; // Full rotation allowed
    controls.minPolarAngle = 0;
    
    // Smooth and responsive controls
    controls.rotateSpeed = 1.0;   // ✅ Responsive rotation speed
    controls.zoomSpeed = 1.0;     // ✅ Smooth zoom speed
    controls.panSpeed = 1.0;      // ✅ Smooth pan speed
    
    // Target Earth center - Earth stays fixed, camera rotates around it
    if (earthGroup) {
        controls.target.copy(earthGroup.position);
    }
    
    // Add zoom change listener for auto-scaling
    controls.addEventListener('change', () => {
        const distance = camera.position.distanceTo(controls.target);
        const zoomScale = Math.max(0.5, Math.min(2.0, distance / 10)); // Scale factor based on distance
        
        // Auto-scale trajectory lines and effects
        autoScaleTrajectoryElements(zoomScale);
        autoScaleEarthEffects(zoomScale);
    });
    
    console.log('✅ Enhanced Earth camera controls created with auto-scaling');
    console.log('✅ Grab-and-rotate: Left-click + drag to rotate POV around stationary Earth');
    console.log('✅ Zoom controls: Mouse scroll to zoom in/out');
    console.log('✅ Pan controls: Right-click + drag to pan view');
    
    return controls;
}

// Auto-scale trajectory elements based on zoom level
function autoScaleTrajectoryElements(zoomScale) {
    // Find all trajectory elements in the scene
    const trajectoryElements = [
        'OrbitalPath', 'OrbitalPathGlow',
        'ApproachTrajectory', 'ApproachTrajectoryGlow',
        'ImpactTrajectory', 'AsteroidTrail'
    ];
    
    trajectoryElements.forEach(elementName => {
        const element = window.scene?.getObjectByName(elementName);
        if (element && element.material) {
            // Use stored base values for consistent scaling
            const baseLinewidth = element.userData?.baseLinewidth || element.material.linewidth;
            const baseOpacity = element.userData?.baseOpacity || element.material.opacity;
            
            // Scale line width based on zoom
            element.material.linewidth = Math.max(1, baseLinewidth * zoomScale);
            
            // Adjust opacity for better visibility at different zoom levels
            if (element.material.opacity !== undefined) {
                element.material.opacity = Math.max(0.2, Math.min(1.0, baseOpacity * zoomScale));
            }
            
            // Mark material as needing update
            element.material.needsUpdate = true;
        }
    });
    
    console.log(`🔄 Auto-scaled trajectory elements with zoom factor: ${zoomScale.toFixed(2)}`);
}

// Auto-scale Earth effects based on zoom level
function autoScaleEarthEffects(zoomScale) {
    // Scale atmospheric effects
    const atmosphere = window.scene?.getObjectByName('Atmosphere');
    if (atmosphere) {
        atmosphere.scale.setScalar(1 + (zoomScale - 1) * 0.1); // Subtle scaling
    }
    
    // Scale cloud effects
    const clouds = window.scene?.getObjectByName('Clouds');
    if (clouds && clouds.material) {
        clouds.material.opacity = Math.max(0.6, Math.min(0.9, 0.8 * zoomScale));
    }
    
    // Scale asteroid particles and effects
    autoScaleAsteroidEffects(zoomScale);
}

// Auto-scale asteroid effects based on zoom level
function autoScaleAsteroidEffects(zoomScale) {
    // Scale asteroid particles
    const asteroidParticles = window.scene?.getObjectByName('AsteroidParticles');
    if (asteroidParticles && asteroidParticles.material) {
        asteroidParticles.material.size = Math.max(0.01, 0.02 * zoomScale);
        asteroidParticles.material.needsUpdate = true;
    }
    
    // Scale asteroid trail
    const asteroidTrail = window.scene?.getObjectByName('AsteroidTrail');
    if (asteroidTrail && asteroidTrail.material) {
        const baseLinewidth = asteroidTrail.userData?.baseLinewidth || 3;
        asteroidTrail.material.linewidth = Math.max(1, baseLinewidth * zoomScale);
        asteroidTrail.material.needsUpdate = true;
    }
    
    // Scale asteroid glow
    const asteroidGlow = window.scene?.getObjectByName('AsteroidGlow');
    if (asteroidGlow) {
        asteroidGlow.scale.setScalar(Math.max(0.5, zoomScale));
    }
}

// Export functions for global use
window.createRealisticEarthModel = createRealisticEarthModel;
window.RealisticEarthAnimationController = RealisticEarthAnimationController;
window.createRealisticLighting = createRealisticLighting;
window.createEarthCameraControls = createEarthCameraControls;

console.log('🌍 Realistic Earth Model loaded successfully!');
