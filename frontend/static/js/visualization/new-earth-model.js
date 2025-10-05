// 🌍 New 3D Earth Model - Using Extracted Assets
console.log('🌍 Loading new 3D Earth model from extracted Assets...');

// Import Earth model from Assets
const NEW_EARTH_CONFIG = {
    radius: 1.0,
    segments: 14, // Using IcosahedronGeometry like the original
    rotationSpeed: 0.0019,
    cloudRotationSpeed: 0.0026,
    glowRotationSpeed: 0.002,
    starRotationSpeed: -0.0002,
    tiltAngle: 23.4 // Earth's axial tilt
};

// Global Earth objects
let newEarthGroup, earthMesh, lightsMesh, cloudsMesh, glowMesh;
let earthTextures = {};
let isNewEarthCreated = false;

// Create new Earth model using the extracted Assets code
async function createNewEarthModel() {
    console.log('🌍 Creating new Earth model from extracted Assets...');
    
    try {
        // Load the Earth model assets if not already loaded
        if (!window.EarthModelAssets) {
            await loadEarthModelAssets();
        }
        
        // Create Earth model using extracted Assets
        const textureLoader = new THREE.TextureLoader();
        
        return new Promise((resolve, reject) => {
            EarthModelAssets.createEarthModel(textureLoader, (earthGroup) => {
                newEarthGroup = earthGroup;
                newEarthGroup.name = 'NewEarthGroup';
                
                // Get references to individual components
                earthMesh = newEarthGroup.getObjectByName('Earth');
                lightsMesh = newEarthGroup.getObjectByName('EarthLights');
                cloudsMesh = newEarthGroup.getObjectByName('EarthClouds');
                glowMesh = newEarthGroup.getObjectByName('EarthGlow');
                
                // Add to scene
                scene.add(newEarthGroup);
                
                isNewEarthCreated = true;
                console.log('✅ New Earth model created successfully!');
                resolve(newEarthGroup);
            });
        });
        
    } catch (error) {
        console.error('❌ Failed to create new Earth model:', error);
        return null;
    }
}

// Load Earth model assets
async function loadEarthModelAssets() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.EarthModelAssets) {
            console.log('✅ Earth model assets already loaded');
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = '../../Assets/earth-model.js';
        script.onload = () => {
            console.log('✅ Earth model assets loaded');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Failed to load Earth model assets');
            reject(new Error('Failed to load Earth model assets'));
        };
        document.head.appendChild(script);
    });
}

// Note: Texture loading and Fresnel material creation are now handled by the extracted Assets

// Update Earth rotation
function updateNewEarthRotation(deltaTime = 16) {
    if (!isNewEarthCreated || !newEarthGroup) return;
    
    // Rotate Earth on its axis
    if (earthMesh) {
        earthMesh.rotation.y += NEW_EARTH_CONFIG.rotationSpeed;
    }
    
    // Rotate lights with Earth
    if (lightsMesh) {
        lightsMesh.rotation.y += NEW_EARTH_CONFIG.rotationSpeed;
    }
    
    // Rotate clouds slightly faster
    if (cloudsMesh) {
        cloudsMesh.rotation.y += NEW_EARTH_CONFIG.cloudRotationSpeed;
    }
    
    // Rotate glow effect
    if (glowMesh) {
        glowMesh.rotation.y += NEW_EARTH_CONFIG.glowRotationSpeed;
    }
}

// Create starfield for the new Earth model using extracted Assets
function createNewStarfield(numStars = 5000) {
    console.log('⭐ Creating starfield using extracted Assets...');
    
    if (window.EarthModelAssets) {
        const starfield = EarthModelAssets.createStarfield(numStars);
        starfield.name = 'NewStarfield';
        return starfield;
    } else {
        console.warn('⚠️ EarthModelAssets not loaded, creating basic starfield');
        return createBasicStarfield(numStars);
    }
}

// Fallback basic starfield
function createBasicStarfield(numStars = 5000) {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        vertexColors: true
    });

    const starVertices = [];
    const starColors = [];
    
    for (let i = 0; i < numStars; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starVertices.push(x, y, z);
        
        const color = new THREE.Color();
        color.setHSL(0.6, 0.4, Math.random());
        starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const points = new THREE.Points(starGeometry, starMaterial);
    points.name = 'NewStarfield';
    return points;
}

// Get Earth position
function getNewEarthPosition() {
    if (!newEarthGroup) return { x: 0, y: 0, z: 0 };
    
    return {
        x: newEarthGroup.position.x,
        y: newEarthGroup.position.y,
        z: newEarthGroup.position.z
    };
}

// Get Earth rotation
function getNewEarthRotation() {
    if (!earthMesh) return { x: 0, y: 0, z: 0 };
    
    return {
        x: earthMesh.rotation.x,
        y: earthMesh.rotation.y,
        z: earthMesh.rotation.z
    };
}

// Set Earth rotation speed
function setNewEarthRotationSpeed(speed) {
    NEW_EARTH_CONFIG.rotationSpeed = speed;
}

// Remove old Earth and replace with new one
function replaceEarthModel() {
    console.log('🔄 Replacing Earth model...');
    
    // Remove existing Earth models
    const existingEarth = scene.getObjectByName('Earth');
    const existingEarthGroup = scene.getObjectByName('EarthGroup');
    const existingNewEarthGroup = scene.getObjectByName('NewEarthGroup');
    
    if (existingEarth) {
        scene.remove(existingEarth);
    }
    if (existingEarthGroup) {
        scene.remove(existingEarthGroup);
    }
    if (existingNewEarthGroup) {
        scene.remove(existingNewEarthGroup);
    }
    
    // Create new Earth model
    createNewEarthModel();
}

// Export functions for use in other modules
window.NewEarthModel = {
    createNewEarthModel,
    updateNewEarthRotation,
    getNewEarthPosition,
    getNewEarthRotation,
    setNewEarthRotationSpeed,
    createNewStarfield,
    replaceEarthModel,
    isNewEarthCreated: () => isNewEarthCreated
};

console.log('🌍 New Earth model module loaded!');
